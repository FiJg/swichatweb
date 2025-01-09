import React, {useState} from 'react'
import {over} from 'stompjs'
import SockJS from 'sockjs-client'

var stompClient = null

const TryChat = () => {
	
	const [publicChats, setPublicChats] = useState([])
	const [privateChats, setPrivateChats] = useState(new Map())
	const [tab, setTab] = useState('CHATROOM')
	const [userData, setUserData] = useState({
		username: '',
		receiverName: '',
		message: '',
	})
	
	// navázání spojení přes websockety s backendem
	function onUserLogin() {
		let sock = new SockJS('http://localhost:8082/ws')
		stompClient = over(sock)
		stompClient.connect({}, onConnected, onError)
	}
	
	// subscribe na dané topicy
	function onConnected() {
		stompClient.subscribe('/chatroom/public', onPublicMessageReceived)
		stompClient.subscribe('/chatroom/1', onPublicMessageReceived)
		stompClient.subscribe('/user/' + userData.username + '/private', onPrivateMessageReceived)
		userJoin()
	}
	
	function userJoin() {
		let chatMessage = {
			senderName: userData.username,
			status: 'JOIN',
		}
		stompClient.send('/app/message', {}, JSON.stringify(chatMessage))
	}
	
	function onPublicMessageReceived(payload) {
		let payloadData = JSON.parse(payload.body)
		
		switch (payloadData.status) {
			case 'JOIN':
				if (!privateChats.get(payloadData.senderName)) {
					privateChats.set(payloadData.senderName, [])
					setPrivateChats(new Map(privateChats))
				}
				break
			case 'MESSAGE':
				publicChats.push(payloadData)
				setPublicChats([...publicChats])
				break
		}
	}
	
	function onPrivateMessageReceived(payload) {
		let payloadData = JSON.parse(payload.body)
		
		if (privateChats.get(payloadData.senderName)) {
			privateChats.get(payloadData.senderName).push(payloadData)
			setPrivateChats(new Map(privateChats))
		} else {
			let list = []
			list.push(payloadData)
			privateChats.set(payloadData.senderName, list)
			setPrivateChats(new Map(privateChats))
		}
	}
	
	function onError(e) {
		console.error(e)
	}
	
	function handleMessage(e) {
		const {value} = e.target
		setUserData({...userData, 'message': value})
	}
	
	function sendPublicMessage() {
		if (stompClient) {
			let chatMessage = {
				senderName: userData.username,
				receiverGroupId: '1',
				message: userData.message,
				status: 'MESSAGE',
			}
			stompClient.send('/app/message', {}, JSON.stringify(chatMessage))
			setUserData({...userData, 'message': ''})
		}
	}
	
	function sendPrivateMessage() {
		if (stompClient) {
			let chatMessage = {
				senderName: userData.username,
				receiverName: tab,
				message: userData.message,
				status: 'MESSAGE',
			}
			// Tohleto dělá ať se uživateli kdo pošle zprávu zapíše ta zpráva hned do pole zpráv
			/*
						if (userData.username !== tab) {
							privateChats.set(tab).push(chatMessage);
							setPrivateChats(new Map(privateChats));
						}
			*/
			stompClient.send('/app/private-message', {}, JSON.stringify(chatMessage))
			setUserData({...userData, 'message': ''})
		}
	}
	
	return (
		<div>
			<input type="text" onChange={e => setUserData({...userData, 'username': e.target.value})}/>
			<button type="button" onClick={onUserLogin}>Login</button>
			<div>
				<ul>
					<li onClick={() => {
						setTab('CHATROOM')
					}}>Chatroom
					</li>
					{[...privateChats.keys()].map((name, index) => (
						<li key={index} onClick={() => {
							setTab(name)
						}}>
							{name}
						</li>
					))}
				</ul>
			</div>
			{tab === 'CHATROOM' &&
				<div>
					<ul>
						{publicChats.map((chat, index) => (
							<li key={index}>
								{chat.senderName !== userData.username && <div>{chat.senderName}</div>}
								{chat.senderName === userData.username && <div>{chat.senderName}</div>}
								<div>{chat.message}</div>
							</li>
						))}
					</ul>
					<div>
						<input type="text" placeholder="Enter message" value={userData.message}
						       onChange={handleMessage}/>
						<button type="button" onClick={sendPublicMessage}>Send</button>
					</div>
				</div>
			}
			{tab !== 'CHATROOM' &&
				<div>
					<ul>
						{[...privateChats.get(tab)].map((chat, index) => (
							<li key={index}>
								{chat.senderName !== userData.username && <div>{chat.senderName}</div>}
								{chat.senderName === userData.username && <div>{chat.senderName}</div>}
								<div>{chat.message}</div>
							</li>
						))}
					</ul>
					<div>
						<input type="text" placeholder="Enter message" value={userData.message}
						       onChange={handleMessage}/>
						<button type="button" onClick={sendPrivateMessage}>Send</button>
					</div>
				</div>
			}
		</div>
	)
}

export default TryChat