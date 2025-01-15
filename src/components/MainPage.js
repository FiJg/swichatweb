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

			// Clear notifications for the active chatroom
			setNotifications((prev) => ({
				...prev,
				[newChatId]: false,
			}));
		} catch (error) {
			console.error('Error changing chat:', error);
		}
	}




	useLayoutEffect(() => {
		return () => {
			stompClient.disconnect()
		}
	}, [])

	useEffect(() => {
		let sock = new SockJS(LOCALHOST_URL + '/ws')

		let lastUpdate = Date.now();

		stompClient = over(sock)

		stompClient.connect({}, () => {
			console.log('WebSocket connected successfully.');
			stompClient.subscribe(`/user/${props.user.username}/notifications`, (message) => {
				const now = Date.now();
				if (now - lastUpdate >= 3000){
					console.log(`Notification received on /user/${props.user.username}/notifications:`, message.body);
				const notification = JSON.parse(message.body);

				setNotifications((prev) => {

					if (prev[notification.chatRoomId]) {
						console.log(`Skipping update for chatRoomId ${notification.chatRoomId}`);
						return prev;
						}
						console.log(`Updating notification for chatRoomId ${notification.chatRoomId}`);
						return {
							...prev,
							[notification.chatRoomId]: true, // Mark the chatroom as having new messages
						};
					});
					lastUpdate = now;

				}
			});
		});

		return () => {
			if (stompClient) stompClient.disconnect();
		};
	}, [props.user.username]);





	useEffect(() => {
		checkReceivedMessages()
	})

	useEffect(() => setReload(false), [reload])

// In MainPage.js, update the handleNewMessage function
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

		axios.get(url, { params })
			.then(result => {
				const updatedChats = new Map(privateChats);

				result.data.forEach(msg => {
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
		if (activeChat.isPublic) {
			sendStompMessage(message, '/app/message')
		} else if (activeChat.isGroup) {
			sendStompMessage(message, '/app/group-message')
		} else {
			sendStompMessage(message, '/app/private-message')
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