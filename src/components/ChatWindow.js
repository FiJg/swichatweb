import {Box, IconButton, Input} from '@mui/material'
import {styled} from '@mui/material/styles'
import {SendRounded} from '@mui/icons-material'
import React, {useEffect, useRef, useState} from 'react'
import axios from "axios";
import activeChat from "sockjs-client/lib/transport/receiver/jsonp";
const LOCALHOST_URL = 'http://localhost:8082'

const TextInput = styled(Input)({
	color: 'white',
	backgroundColor: '#39393c',
	borderRadius: '20px',
	padding: '5px 15px',
	width: '100%',
	minHeight: '40px',
	'&.MuiInput-underline:after': {
		borderColor: 'transparent',
	},
	'&.MuiInput-underline:before': {
		borderColor: 'transparent',
	},
	'&:not(.Mui-disabled):hover::before': {
		borderColor: 'transparent',
	},
})

const SendButton = styled(IconButton)({
	':hover': {
		background: '#39393c',
	},
	float: 'right',
})

const ChatWindow = (props) => {
	const [message, setMessage] = useState('')

	const formRef = useRef(null)

	function send(e) {
		e.preventDefault()
		console.log("Send function called!");
		if(message.length > 250) {
			alert('Message cannot be longer than 250 characters!')
			return;
		}

		props.sendMessage(message)
		formRef.current.reset()
		setMessage('')
	}

	function onKeyDown(e) {
		if (e.keyCode === 13 && !e.shiftKey) {
			send(e)
		}
	}

	function formatDate(dateTime) {
		const options = {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'}
		return new Date(dateTime).toLocaleDateString(undefined, options)
	}

	function scrollToBottom() {
		const chat = document.getElementById('chat')

		if (chat) {
			chat.scrollTop = chat.scrollHeight
		}
	}


	function addUsersToGroupChat(e) {

		let users = prompt('Enter the usernames of the users you want to add to the group chat, separated by commas,')
		if(users.length === 0) {
			alert('Pridajte aspon jedneho uzivatela')
			return;
		}

		users = users.split(/\s*,\s*/)
		const { chatId } = props.activeChat.id;
		//var urlString = LOCALHOST_URL + '/api/chatroom/'+{$chatId}+'/chatusers/'+{$users};
		//urlString
		//axios.put(LOCALHOST_URL+ '/api/chatroom/${chatId}/chatusders/${users}', {
		/// axios.put(LOCALHOST_URL+ '/api/chatroom/addusertogroup', {
		//axios.post(LOCALHOST_URL+ '/api/chatroom/assignUserToRoom', {
		axios.post(LOCALHOST_URL+ '/api/chatroom/${chatroomID}/assign', {
				username:users
			})
			.then((result) => fetchChatRooms(e))
			.catch((e) => console.error(e))
	}

	useEffect(() => {
		if (props.activeChat && props.privateChats.has(props.activeChat.id)) {
			scrollToBottom();
		}
	}, [props.activeChat, props.privateChats]);


	//send button

	return (
		<>
			{props.isLoading ? (
				<></>
			) : (
				<Box sx={{
					position: 'absolute', padding: '10px',
					...(props.isSmallRes === true && {
						left: '80px',
						width: 'calc(100% - 110px)',
					}),
					...(props.isSmallRes === false && {
						left: '320px',
						width: 'calc(100% - 340px)',
					}),
					textAlign: 'center',
					height: 'calc(100% - 65px - 20px)',
				}}>

					<Box sx={{position: 'relative', height: '100%'}}>
						<Box sx={{position: 'absolute', bottom: '0', width: '80%'}}>
							<form onSubmit={send} ref={formRef}>
								<div className="MessageInput">
									<SendButton type="submit">
										<SendRounded color="secondary"/>
									</SendButton>

									<div>
										<TextInput
											multiline
											placeholder="Napíšte správu..."
											onChange={e => {
												setMessage(e.target.value)
											}}
											onKeyDown={onKeyDown}
										/>
									</div>
								</div>
							</form>
						</Box>



						<Box sx={{position: 'absolute', bottom: '0', right:'0', width: '10%'}}>
							<form onSubmit={addUsersToGroupChat} ref={formRef}>
								<div className="MessageInput">
									<textarea id="message" rows="2" cols="2" value={props.activeChat.id} readOnly />
									<textarea id="message" rows="2" cols="10" value={props.activeChat.name} readOnly />
									<textarea id="message" rows="2" cols="10" value={props.user.id} readOnly />
									<SendButton type="submit">
										<SendRounded color="secondary"/>
									</SendButton>
								</div>
							</form>
						</Box>



						<Box id={'chat'} sx={{
							overflowY: 'auto',
							overflowX: 'hidden',
							height: '95%',
							scrollbarWidth: 'none',
							msOverflowStyle: 'none',
							'&::-webkit-scrollbar': {
								width: 0,
							},
							scrollBehavior: 'smooth',
						}}>


							{[...(props.privateChats.get(props.activeChat.id) || [])].map((msg, index) => (
								<Box key={`${msg.id}-${index}`} sx={{ paddingBottom: '10px', width: '100%', overflow: 'auto' }}>
									{msg.user && msg.user.id === props.user.id ? (
										<div>
											<div style={{
												padding: '10px',
												float: 'right',
												clear: 'both',
												textAlign: 'left',
												fontSize: '11px',
											}}>
                        <span style={{ fontSize: '13px' }}>
                            <b>{msg.user.username || 'Unknown'}</b>
                        </span> {formatDate(msg.sendTime)}
											</div>
											<Box sx={{
												padding: '10px',
												float: 'right',
												clear: 'both',
												textAlign: 'left',
												backgroundColor: '#7505ff',
												borderRadius: '15px',
												maxWidth: '75%',
											}}>
												{msg.content}
											</Box>
										</div>
									) : (
										<div>
											<div style={{
												padding: '10px',
												float: 'left',
												clear: 'both',
												textAlign: 'left',
												fontSize: '11px',
											}}>
                        <span style={{ fontSize: '13px' }}>
                            <b>{msg.user?.username || 'Unknown'}</b>
                        </span> {formatDate(msg.sendTime)}
											</div>
											<Box sx={{
												padding: '10px',
												float: 'left',
												clear: 'both',
												textAlign: 'left',
												backgroundColor: '#494157',
												borderRadius: '15px',
												maxWidth: '75%',
											}}>
												{msg.content}
											</Box>
										</div>
									)}
								</Box>
							))}
						</Box>

							<Box sx={{paddingBottom: '10px', width: '100%', overflow: 'auto'}}>
							</Box>
					</Box>
				</Box>
			)}

		</>
	)
}

export default ChatWindow