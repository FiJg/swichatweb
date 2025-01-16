import React, {useEffect, useLayoutEffect, useState} from 'react'
import ChatSelection from './ChatSelection'
import ChatWindow from './ChatWindow'
import {useMediaQuery, useTheme} from '@mui/material'
import {over} from 'stompjs'
import SockJS from 'sockjs-client'
import axios from 'axios'

let stompClient = null;

const LOCALHOST_URL = 'http://localhost:8082'


const Menu = (props) => {

    const theme = useTheme()
    const isSmallRes = useMediaQuery(theme.breakpoints.down('sm'))

    const [notifications, setNotifications] = useState({}); // Track notifications by chatroom ID

    const [activeChat, setActiveChat] = useState()
    const [privateChats, setPrivateChats] = useState(new Map())
    const [reload, setReload] = useState(false)

    const [isLoading, setIsLoading] = useState(true)

    async function handleChatChange(e, newChatId) {
        if (!newChatId || activeChat?.id === newChatId) {
            return; // Avoid redundant updates or undefined chat selection
        }
        try {
            const result = await axios.get(`${LOCALHOST_URL}/api/chatroom/${newChatId}`);
            setActiveChat(result.data);

            setNotifications((prev) => {
                const updated = { ...prev, [newChatId]: false };
                console.log('Cleared notifications for chatRoomId:', newChatId, updated);
                return updated;
            });
        } catch (error) {
            console.error('Error changing chat:', error);
        }
    }


    useLayoutEffect(() => {

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, []);


    //subscribe on mount
    useEffect(() => {

        let sock = new SockJS(LOCALHOST_URL + '/ws')

        stompClient = over(sock)

        stompClient.connect({}, () => {
            console.log('WebSocket connected successfully.');

			//subscribing to notifications
            stompClient.subscribe(`/user/${props.user.username}/notifications`, (message) => {

                console.log(`Notification received on /user/${props.user.username}/notifications:`, message.body);

				const notification = JSON.parse(message.body);
				const chatId = notification.chatRoomId;

                console.log(
                    `Notification for chat: ${chatId} - Active chat is: ${activeChat?.id}`
                );


				// setting red dot if this is not the active chat
				setNotifications((prev) => {
					// If user is actively viewing chatId, skip
					if (activeChat && chatId === activeChat.id) {
						console.log('Skipping dot because user is in that chat.');
						return prev;
					}

					// Otherwise show the dot
					console.log('Setting dot for chatId:', chatId);
					return { ...prev, [chatId]: true };
				});
                //fetching messages
                checkReceivedMessages();
			});
		});

        return () => {
			if (stompClient && stompClient.connected) {
				stompClient.disconnect();
			}
        };
    }, [activeChat, props.user.username]);


    useEffect(() => {
        if (!isLoading) {
            checkReceivedMessages();
        }
    }, [isLoading, reload]);

// In Menu.js, update the handleNewMessage function
    const handleNewMessage = (newMessage) => {
        setPrivateChats((prevChats) => {
            const updatedChats = new Map(prevChats);
            const chatMessages = updatedChats.get(activeChat.id) || [];
            updatedChats.set(activeChat.id, [...chatMessages, newMessage]);
            return updatedChats;
        });

        // If message is for a different chat room, show notification
        if (newMessage.room.id !== activeChat.id) {
            setNotifications(prev => ({
                ...prev,
                [newMessage.room.id]: true
            }));
        }
    };

    function onConnected() {
        stompClient.subscribe('/chatroom/public', onMessageReceived)
    }

    function onError(e) {
        console.error(e)
    }

    function checkReceivedMessages() {
        if (isLoading) return

        const url = LOCALHOST_URL + '/api/queue'
        const params = new URLSearchParams([['username', props.user.username]])

        axios.get(url, {params})
            .then(result => {
                result.data.forEach(i => {
                    privateChats.get(i.room.id).push(i)
                    setPrivateChats(new Map(privateChats))
                })
            })
            .catch(error => console.error(error))
    }

    function onPrivateMessageReceived(payload) {
    }


    function onMessageReceived(payload) {
        const url = LOCALHOST_URL + '/api/queue';
        const params = new URLSearchParams([['username', props.user.username]]);

        axios.get(url, {params})
            .then(result => {
                const updatedChats = new Map(privateChats);

                result.data.forEach(msg => {
                    // Adding ephemeral timestamp for the currently logged in user
                    msg.retrievedFromQueueTimestamp = new Date().getTime();

                    // Inserting the message into the correct chat
                    if (!updatedChats.has(msg.room.id)) {
                        updatedChats.set(msg.room.id, []);
                    }
                    updatedChats.get(msg.room.id).push(msg);
                });

                setPrivateChats(updatedChats);
            })
            .catch(error => console.error(error));
    }

    function onPublicMessageReceived(payload) {
        const url = LOCALHOST_URL + '/api/queue'
        const params = new URLSearchParams([['username', props.user.username]])
        try {
            axios.get(url, {params})
                .then(result => {
                    result.data.forEach(i => {
                        privateChats.get(i.room.id).push(i)
                        setPrivateChats(new Map(privateChats))
                    })
                })
        } catch (e) {
            console.error('Error')
        }
    }


    function sendMessage(message) {
        if (!activeChat) return;

        let destination;
        if (activeChat.isPublic) {
            destination = '/app/message';
        } else if (activeChat.isGroup) {
            destination = '/app/group-message';
        } else {
            destination = '/app/private-message';
        }

        if (stompClient) {
            const payloadMsg = {
                senderId: props.user.id,
                chatId: activeChat.id,
                content: message,
                date: Date.now(),
            };
            stompClient.send(destination, {}, JSON.stringify(payloadMsg));
            setReload(true);
        }

    }

    function sendStompMessage(message, destination) {
        if (stompClient) {
            let payloadMsg = {
                senderId: props.user.id,
                chatId: activeChat.id,
                content: message,
                date: new Date().getTime(),
            }

            stompClient.send(destination, {}, JSON.stringify(payloadMsg))

            setReload(true)
        }
    }


    function sendPublicMessage(message) {
        if (stompClient) {
            let payloadMsg = {
                senderId: props.user.id,
                chatId: activeChat.id,
                content: message,
                date: new Date().getTime(),
            }
            stompClient.send('/app/message', {}, JSON.stringify(payloadMsg))
        }
    }

    function sendGroupMessage(message) {
        if (stompClient) {
            let payloadMsg = {
                senderId: props.user.id,
                chatId: activeChat.id,
                content: message,
                date: new Date().getTime(),
            }
            stompClient.send('/app/group-message', {}, JSON.stringify(payloadMsg))
        }
    }

    function sendPrivateMessage(message) {
        if (stompClient) {
            let payloadMsg = {
                senderId: props.user.id,
                chatId: activeChat.id,
                content: message,
                date: new Date().getTime(),
            }
            stompClient.send('/app/private-message', {}, JSON.stringify(payloadMsg))
        }
    }

    return (
        <>
            <ChatSelection activeChat={activeChat}
                           setActiveChat={setActiveChat}
                           handleChatChange={handleChatChange}
                           isSmallRes={isSmallRes}
                           user={props.user}
                           notifications={notifications}
                           privateChats={privateChats}
                           setPrivateChats={setPrivateChats}
                           isLoading={isLoading}
                           setIsLoading={setIsLoading}/>
            <ChatWindow activeChat={activeChat}
                        isSmallRes={isSmallRes}
                        user={props.user}
                        privateChats={privateChats}
                        isLoading={isLoading}
                        sendMessage={sendMessage}/>
        </>
    )
}

export default Menu