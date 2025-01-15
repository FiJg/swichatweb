import {Avatar, Box, IconButton, Input} from '@mui/material'
import {styled} from '@mui/material/styles'
import {SendRounded} from '@mui/icons-material'
import React, {useEffect, useRef, useState} from 'react'
import axios from "axios";
import activeChat from "sockjs-client/lib/transport/receiver/jsonp";
const LOCALHOST_URL = 'http://localhost:8082'

const validExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
const avatarBaseUrl = `${LOCALHOST_URL}/uploads/avatars/`;

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
	const [file, setFile] = useState(null); // New state for file

	const [failedAvatars, setFailedAvatars] = useState(new Set()); // Track failed avatar requests
	const imgRefs = {}; // Ref object for avatar images
	const formRef = useRef(null)


	const getAvatarUrl = (username) => `${avatarBaseUrl}${username}.png`;

	const handleAvatarError = (username) => {
		setFailedAvatars((prev) => new Set([...prev, username]));
	};

	// Render avatar or fallback to letter avatar
	const renderAvatar = (username) => {
		if (!failedAvatars.has(username)) {
			if (!imgRefs[username]) {
				imgRefs[username] = React.createRef();
			}

			return (
				<img
					ref={imgRefs[username]}
					src={getAvatarUrl(username)}
					alt={username}
					onError={() => handleAvatarError(username)}
					style={{ width: '40px', height: '40px', borderRadius: '50%', marginLeft: '10px' }}
				/>
			);
		}

		return (
			<Avatar sx={{ bgcolor: '#9c49f3', color: 'white' }}>
				{username.charAt(0).toUpperCase()}
			</Avatar>
		);
	};

	async function send(e) {
		e.preventDefault()
		console.log("Send function called!");

		if (message.trim().length === 0 && !file) {
			alert('You cannot send an empty message unless a file is attached.');
			return;
		}

		if (message.length > 250) {
			alert('Message cannot be longer than 250 characters!')
			return;
		}

		let fileUrl = null;
		let fileName = null;
		let fileType = null;

		if (file) {
			const formData = new FormData();
			formData.append('file', file);

			try {
				const response = await axios.post(`${LOCALHOST_URL}/api/messages/upload`, formData);
				fileUrl = response.data.fileUrl;
				fileName = file.name;
				fileType = file.type;
			} catch (error) {
				console.error('File upload failed:', error);
				alert('Failed to upload the file.');
				return;
			}
		}


		props.sendMessage({
			content: message.trim(),
			fileUrl,
			fileName,
			fileType,
		});

		formRef.current.reset()
		setMessage('')
		setFile(null);
	}

	function onKeyDown(e) {
		if (e.keyCode === 13 && !e.shiftKey) {
			send(e)
		}
	}

	function formatDateToLocal(timestamp) {
		if (!timestamp) return "Not Retrieved";

		// Ensure timestamp is a valid number and in milliseconds
		if (typeof timestamp === "string" || typeof timestamp === "number") {
			const timestampMs = typeof timestamp === "number" && timestamp < 1e12 ? timestamp * 1000 : timestamp;
			const date = new Date(timestampMs);

			// Check if date is valid
			if (!isNaN(date.getTime())) {
				return date.toLocaleString(undefined, {
					year: 'numeric',
					month: 'numeric',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
				});
			}
		}

		return "Invalid Date";
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

		let user = prompt('Enter the username of the user you want to add to the group chat:');
		if (!user || user.trim().length === 0) {
			alert('Please enter a valid username.');
			return;
		}


		const chatroomID = props.activeChat.id;

		//var urlString = LOCALHOST_URL + '/api/chatroom/'+{$chatId}+'/chatusers/'+{$users};
		//urlString
		//axios.put(LOCALHOST_URL+ '/api/chatroom/${chatId}/chatusders/${users}', {
		/// axios.put(LOCALHOST_URL+ '/api/chatroom/addusertogroup', {
		//axios.post(LOCALHOST_URL+ '/api/chatroom/assignUserToRoom', {

		axios.post(`${LOCALHOST_URL}/api/chatroom/assign/${chatroomID}`, {
			userName: user.trim(), // Send a single username
			reqUserId: props.user.id, // Requesting user's ID
			roomId: chatroomID,
		})
			.then(() => {
				alert(`User "${user.trim()}" successfully added to the group chat!`);
				fetchChatRooms(e); // Refresh chatrooms after adding
			})
			.catch((err) => {
				console.error('Failed to add user to group chat:', err);
				alert(`Failed to add user "${user.trim()}" to the group chat. Please try again.`);
			});
	}

	useEffect(() => {
		if (props.activeChat && props.privateChats.has(props.activeChat.id)) {
			scrollToBottom();
		}
		scrollToBottom();
	}, [props.activeChat, props.privateChats]);

	//send button

	return (
		<>
			{props.isLoading ? (
				<></>
			) : (
				<Box sx={{
					position: 'absolute', padding: '10px',
					...(props.isSmallRes === true && {left: '80px', width: 'calc(100% - 110px)',
					}),
					...(props.isSmallRes === false && {left: '320px',
						width: 'calc(100% - 340px)',
					}),
					textAlign: 'center',
					height: 'calc(100% - 65px - 20px)',
				}}>

					<Box sx={{position: 'relative', height: '100%'}}>
						<Box sx={{position: 'absolute', bottom: '0', width: '80%'}}>
							<form onSubmit={send} ref={formRef}>
								<div className="MessageInput">
									<input
										type="file"
										onChange={(e) => setFile(e.target.files[0])} // Update file state
										style={{ marginBottom: '10px', display: 'block' }}
									/>
									<SendButton type="submit">
										<SendRounded color="secondary"/>
									</SendButton>

									<div>
										<TextInput
											multiline
											placeholder="Napíšte správu..."
											value={message}
											onChange={e => {
												setMessage(e.target.value)
											}}
											onKeyDown={onKeyDown}
										/>
									</div>
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
//dis
							}}>


							{[...(props.privateChats.get(props.activeChat.id) || [])].map((msg, index) => (
								<Box key={`${msg.id}-${index}`} sx={{ paddingBottom: '10px', width: '100%', overflow: 'auto' }}>
									{renderAvatar(msg.username)}
									{msg.username === props.user.username ? (
										<div>
											<div style={{
												padding: '10px',
												float: 'right',
												clear: 'both',
												textAlign: 'left',
												fontSize: '11px',
											}}>
											<span style={{ fontSize: '13px' }}>
												<b>{msg.username || 'Unknown'}</b>
											</span> {' '} {formatDate(msg.sendTime)}
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
												{/* Check if a file is attached */}
												{msg.fileUrl ? (
														msg.fileType && msg.fileType.startsWith('image/') ? (
															// Render image if it's an image file
															<img
																src={msg.fileUrl}
																alt={msg.fileName || 'Image'}
																style={{ maxWidth: '100%', borderRadius: '10px' }}
															/>
														) : (
															// Provide a download link for non-image files
															<a
																href={msg.fileUrl}
																target="_blank"
																rel="noopener noreferrer"
																style={{ color: 'white', textDecoration: 'underline' }}
															>
																{msg.fileName || 'Download File'}
															</a>
														)
													) :
													(
														// Render plain text content

														msg.content
													)}

												{/* Add timestamps */}
												<div style={{ marginTop: '5px', fontSize: '11px', color: '#cccccc' }}>
													<div>
														Added to Queue:{' '}
														{msg.addedToQueueTimestamp && formatDateToLocal(msg.addedToQueueTimestamp)}
													</div>
													<div>
														Retrieved from Queue:{' '}
														{msg.retrievedFromQueueTimestamp && formatDateToLocal(msg.retrievedFromQueueTimestamp)}
													</div>
												</div>
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
                           						 <b>{msg.username || 'Unknown'}</b>
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
												{/* Check if a file is attached */}
												{msg.fileUrl ? (
													msg.fileType && msg.fileType.startsWith('image/') ? (
														// Render image if it's an image file
														<img
															src={msg.fileUrl}
															alt={msg.fileName || 'Image'}
															style={{ maxWidth: '100%', borderRadius: '10px' }}
														/>
													) : (
														// Provide a download link for non-image files
														<a
															href={msg.fileUrl}
															target="_blank"
															rel="noopener noreferrer"
															style={{ color: 'white', textDecoration: 'underline' }}
														>
															{msg.fileName || 'Download File'}
														</a>
													)
												) : (
													// Render plain text content
													msg.content
												)}
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