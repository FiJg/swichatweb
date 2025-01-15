import {Avatar, Box, IconButton, Input} from '@mui/material'
import {styled} from '@mui/material/styles'
import {SendRounded} from '@mui/icons-material'
import {SendSharp} from "@mui/icons-material";
import React, {useEffect, useRef, useState} from 'react'
import axios from "axios";
import activeChat from "sockjs-client/lib/transport/receiver/jsonp";
const LOCALHOST_URL = 'http://localhost:8082'

const validExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
const avatarBaseUrl = `${LOCALHOST_URL}/uploads/avatars/`;

const TextInput = styled(Input)({
	color: 'black',
	backgroundColor: '#d2d2d2',
	borderRadius: '10px',
	padding: '0.5em 2em',
	width: '100%',
	minHeight: '2em',
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
		background: '#0066ff',
	},
	float: 'right',
})


/**
 * ChatWindow Component
 * handles viewing and sending messages
 * @param {Object} props - Component props including user data, active chat info,
 *                         and message viewing/sending functions
 */


const ChatWindow = (props) => {

	if (!props.activeChat) {
		return <div style={{ padding: '1em' }}>No chat selected.</div>;
	}

	const [message, setMessage] = useState('')
	const [file, setFile] = useState(null);

	const [failedAvatars, setFailedAvatars] = useState(new Set());
	const imgRefs = {}; // Ref object for avatar images

	const formRef = useRef(null)


	const getAvatarUrl = (username) => `${avatarBaseUrl}${username}.png`;

	const handleAvatarError = (username) => {
		setFailedAvatars((prev) => new Set([...prev, username]));
	};

	// Renders avatar or fallback to letter avatar (avatar couldn't be found/loaded)
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
			<Avatar sx={{ bgcolor: '#0066ff', color: 'white' }}>
				{username.charAt(0).toUpperCase()}
			</Avatar>
		);
	};

	/**
	 * Message handling, text and files
	 * @param {Event} e - form submission event
	 * @returns {Promise<void>}
	 */

	async function send(e) {
		e.preventDefault()
		console.log("Send function called!");

		if (message.trim().length === 0 && !file) {
			alert('You cannot send an empty message unless a file is attached.');
			return;
		}

		if (message.length > 500) {
			alert('Message cannot be longer than 500 characters!')
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

		//form reset
		formRef.current.reset()
		setMessage('')
		setFile(null);
	}

	function onKeyDown(e) {
		if (e.keyCode === 13 && !e.shiftKey) {
			send(e)
		}
	}

	/**
	 * Timestamp formatter
	 * @param timestamp
	 * @returns {*|string}
	 */
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

	/**
	 * dateTime formatter
	 * @param dateTime
	 * @returns {*}
	 */
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


	//scroll to bottom when messages/chat changes
	useEffect(() => {
		if (props.activeChat && props.privateChats.has(props.activeChat.id)) {
			scrollToBottom();
		}
		scrollToBottom();
	}, [props.activeChat, props.privateChats]);


	return (
		<>
			{props.isLoading ? (
				<>Loading</>
			) : (

				//Main container
				<Box sx={{
					position: 'absolute', padding: '5px', ...(props.isSmallRes === true && {left: '80px', width: 'calc(100% - 110px)',}),
					...(props.isSmallRes === false && {left: '20em', width: 'calc(100% - 20em)',}),
					textAlign: 'center', height: 'calc(100% - 5em)',
				}}>
					<Box sx={{position: 'relative', height: '100%'}}>

						<Box sx={{position: 'absolute', bottom: '1em', width: '50%'}}
							//input bar
						>

							<form onSubmit={send} ref={formRef}>
								<div className="MessageInput">
									{/* File input  */}
									<input
										type="file"
										onChange={(e) => setFile(e.target.files[0])} // Update file state
										style={{ marginBottom: '10px', display: 'block' }}
									/>

									<SendButton type="submit">
										<SendRounded color="secondary"/>
									</SendButton>
									{/* Text input */}
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
							//Chat messages
							overflowY: 'auto', overflowX: 'hidden',
							height: '88% ',
							scrollbarWidth: 'none', msOverflowStyle: 'none', '&::-webkit-scrollbar': {width: 0,},
							scrollBehavior: 'smooth',
							}}>

							{[...(props.privateChats.get(props.activeChat.id) || [])].map((msg, index) => (
								<Box key={`${msg.id}-${index}`} sx={{ paddingBottom: '3em', width: '98%',
									overflow: 'auto', display: 'flex', flexDirection: 'row', alignItems: 'flex-start',
									justifyContent: msg.username === props.user.username ? 'flex-end' : 'flex-start',
									gap: '8px'
								}}>
									{/* For received messages, render avatar first */}
									{msg.username !== props.user.username && (
										<Box sx={{ flexShrink: 0, marginTop: '10px' }}> {/* Prevent avatar from shrinking */}
											{renderAvatar(msg.username)}
										</Box>
									)}

									{msg.username === props.user.username ? (
										<div style={{ maxWidth: '66%', minWidth: '100px' }}>
											<div style={{
												padding: '10px',
												float: 'right',
												clear: 'both',
												textAlign: 'left',
												fontSize: '10px', //date on top
											}}>
											<span style={{ fontSize: '14px' }}><b>{msg.username || 'Unknown user'}</b></span>
												{' '} {formatDate(msg.sendTime)}
											</div>
											<Box sx={{
												padding: '1em', float: 'right', clear: 'both', textAlign: 'left',
												backgroundColor: '#0066ff', borderRadius: '10px', width: '100%',
											}}>

												{/* Check if a file is attached */}

												{msg.fileUrl ? (
														msg.fileType && msg.fileType.startsWith('image/') ? (
															// Render image if it's an image file
															<img
																src={`${LOCALHOST_URL}/uploads/${msg.fileUrl}`}
																alt={msg.fileName || 'Image'}
																style={{ maxWidth: '100%', borderRadius: '10px' }}
															/>
														) : (
															// Provide a download link for non-image files
															<a
																src={`${LOCALHOST_URL}/uploads/${msg.fileUrl}`}
																target="_blank"
																rel="noopener noreferrer"
																style={{ color: 'white', textDecoration: 'underline', margin: '5px 0', display: 'block' }}
																download={msg.fileName || 'Download'}
															>
																Download {msg.fileName || 'File'}
															</a>
														)
													) :
													(
														// Render plain text content

														msg.content
													)}

												{/* Timestamps */}
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
											{/* Sender Message box ends before*/ }
										</div>
										//Sender Message div ends before
									) : (
										//Recipient message box
										<div style={{ maxWidth: '66%', minWidth: '15%' }}>
											<div style={{
												padding: '10px', float: 'left', clear: 'both', textAlign: 'left', fontSize: '10px',
											}}>
												<span style={{ fontSize: '14px' }}><b>{msg.username || 'Unknown'}</b></span>
												{' '}{formatDate(msg.sendTime)}
											</div>
											<Box sx={{
												padding: '10px', float: 'left', clear: 'both', textAlign: 'left', backgroundColor: '#d0d0d0',
												color: 'black', borderRadius: '10px', Width: '100%',
											}}>

												{/* Check if a file is attached */}
												{msg.fileUrl ? (
														msg.fileType && msg.fileType.startsWith('image/') ? (
															// Render image if it's an image file
															<img
																src={`${LOCALHOST_URL}/uploads/${msg.fileUrl}`}
																alt={msg.fileName || 'Image'}
																style={{ maxWidth: '100%', borderRadius: '10px' }}
															/>
														) : (
															// Provide a download link for non-image files
															<a
																href={`${LOCALHOST_URL}/uploads/${msg.fileUrl}`}
																target="_blank"
																rel="noopener noreferrer"
																style={{ color: 'black', textDecoration: 'underline', margin: '5px 0', display: 'block' }}
																download={msg.fileName || 'Download'}
															>
																Download {msg.fileName || 'File'}

															</a>




														)
													) :
													(
														// Render plain text content
														msg.content
													)}
												{/* Timestamps */}
												<div style={{ marginTop: '5px', fontSize: '11px', color: '#66666f' }}>
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
									)}
									{/* For sent messages, render avatar last */}
									{msg.username === props.user.username && (
										<Box sx={{ flexShrink: 0, marginTop: '10px' }}> {/* Prevent avatar from shrinking */}
											{renderAvatar(msg.username)}
										</Box>
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