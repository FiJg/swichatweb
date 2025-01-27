import {Avatar, Box, IconButton, Input, Typography, styled} from '@mui/material'
import {SendRounded, AttachFile } from '@mui/icons-material'
import {SendSharp} from "@mui/icons-material";
import React, {useEffect, useRef, useState} from 'react'
import activeChat from "sockjs-client/lib/transport/receiver/jsonp";

import axios from "axios";

const LOCALHOST_URL = 'http://localhost:8082'

const validExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
const avatarBaseUrl = `${LOCALHOST_URL}/uploads/avatars/`;

const TextInput = styled(Input)({
	color: '#ffffff',
	backgroundColor: '#0066ff',
	borderRadius: '20px',
	padding: '10px 20px',
	width: '100%',
	minHeight: '3em',
	fontFamily: 'Play, sans-serif',
	boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
	'& .MuiInput-input': {
		padding: 0,
		color: '#ffffff',
	},
	'&::before': {
		borderBottom: 'none',
	},
	'&::after': {
		borderBottom: 'none',
	},
	'&:hover::before': {
		borderBottom: 'none',
	},
	'&::placeholder': {
		color: '#ffffff',
		opacity: 0.7,
	},
})

const SendButton = styled(IconButton)({
	color: '#0066ff',
	backgroundColor: '#f5f5f5',
	borderRadius: '50%',
	marginLeft: '10px',
	'&:hover': {
		backgroundColor: '#e3f2fd',
	},
});

const MessageBubble = styled(Box)(({ isSender }) => ({
	display: 'flex',
	flexDirection: 'column',
	alignItems: isSender ? 'flex-end' : 'flex-start',
	marginBottom: '10px',
}));

const Timestamp = styled(Typography)({
	fontSize: '0.75rem',
	color: '#666666',
	marginTop: '2px',
	fontFamily: 'Play, sans-serif',
});


const MessageContent = styled(Box)(({ isSender }) => ({
	backgroundColor: isSender ? '#0066ff' : '#e0e0e0',
	color: isSender ? '#ffffff' : '#333333',
	borderRadius: '15px',
	padding: '10px 15px',
	maxWidth: '60%',
	wordWrap: 'break-word',
	fontFamily: 'Play, sans-serif',
}));


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

	const isUserSignedIn = !!props.user;

	const isMainRoom = props.activeChat?.isPublic && props.activeChat?.name === "Main Chat";


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

		if (!isUserSignedIn) {
			alert("You must be signed in to send messages.");
			return;
		}

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
				//alert('Failed to upload the file.');
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

		const date = new Date(typeof timestamp === "number" && timestamp < 1e12 ? timestamp * 1000 : timestamp);

		if (isNaN(date.getTime())) return "Invalid Date";

		const options = {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			fractionalSecondDigits: 3,
			hour12: false, // Ensures 24-hour format
		};

		const formattedDate = date.toLocaleString(undefined, options);
		const utcOffset = getUTCOffset(date);

		return `${formattedDate} UTC${utcOffset}`;
	}
	/**
	 * dateTime formatter
	 * @param dateTime
	 * @returns {*}
	 */
	function formatDate(dateTime) {
		const date = new Date(dateTime);
		if (isNaN(date.getTime())) return "Invalid Date";

		const options = {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			fractionalSecondDigits: 3,
			hour12: false, // Ensures 24-hour format
		};

		const formattedDate = date.toLocaleString(undefined, options);
		const utcOffset = getUTCOffset(date);

		return `${formattedDate} UTC${utcOffset}`;
	}

	/**
	 * Calculates the local UTC offset in ±HH:MM format.
	 * @param {Date} date - The date object to calculate the offset for.
	 * @returns {string} - The UTC offset as a string.
	 */
	function getUTCOffset(date) {
		const offsetInMinutes = date.getTimezoneOffset();
		const absoluteOffset = Math.abs(offsetInMinutes);
		const sign = offsetInMinutes <= 0 ? '+' : '-';
		const hours = String(Math.floor(absoluteOffset / 60)).padStart(2, '0');
		const minutes = String(absoluteOffset % 60).padStart(2, '0');
		return `${sign}${hours}:${minutes}`;
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
					position: 'absolute',
					padding: '20px',
					paddingLeft: '25px',
					backgroundColor: '#f5f5f5',
					...(props.isSmallRes === true && {
						left: '80px', width: 'calc(100% - 110px)',}),
					...(props.isSmallRes === false && {
						left: '320px', width: 'calc(100% - 320px)',}),
					textAlign: 'center',
					height: 'calc(100% - 80px)',
				}}>
					<Box sx={{position: 'relative', height: '100%'}}>

						<Box sx={{position: 'absolute', bottom: '1em', width: '75%'}}
						>
							{/* Input bar, condtitional*/}
							{(!isMainRoom || isUserSignedIn) ? (
							<form onSubmit={send} ref={formRef}>
								<div className="MessageInput" style={{ display: 'flex', alignItems: 'center' }}>
									{/* Text input */}
									<TextInput
										multiline
										placeholder="Write a message..."
										value={message}
										onChange={e => {
											setMessage(e.target.value)
										}}
										onKeyDown={onKeyDown}
									/>

									{/* Send Button */}
									<SendButton type="submit">
										<SendSharp  sx={{ color: '#0066ff' }} />
									</SendButton>

									{/* File Input Button with Icon */}
									<label htmlFor="file-upload" style={{ marginLeft: '10px' }}>
										<input
											id="file-upload"
											type="file"
											accept={validExtensions.join(',')}
											onChange={(e) => setFile(e.target.files[0])} // Update file state
											style={{ display: 'none' }}
										/>
										<IconButton component="span" sx={{ color: '#0066ff', backgroundColor: '#f5f5f5', '&:hover': { backgroundColor: '#e3f2fd' } }}>
											<AttachFile />
										</IconButton>
									</label>
								</div>
							</form>

							) : (
								<Typography sx={{ color: "gray", fontFamily: "Play, sans-serif" }}>
									Sign in to send messages in this room.
								</Typography>
							)}

						</Box>



						<Box id={'chat'} sx={{
							//Chat messages
							overflowY: 'auto', overflowX: 'hidden',
							height: '88% ',
							scrollbarWidth: 'none', msOverflowStyle: 'none', '&::-webkit-scrollbar': {width: 0,},
							scrollBehavior: 'smooth',
							backgroundColor: '#f5f5f5',
							color: '#000000',
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
												fontSize: '10px',
												color: '#000000',
											}}>
												<span style={{ fontSize: '14px' }}><b>{msg.username || 'Unknown user'}</b></span>
												{' '} {formatDate(msg.sendTime)}
											</div>
											<Box sx={{
												padding: '1em', float: 'right', clear: 'both', textAlign: 'left',
												backgroundColor: '#0066ff', borderRadius: '10px', width: '100%',
												color: 'whitesmoke'
											}}>

												{/* Rendering both text and file if present */}
												{msg.content && (
													<Typography variant="body1" sx={{ marginBottom: msg.fileUrl ? '10px' : '0' }}>
														{msg.content}
													</Typography>
												)}


												{msg.fileUrl && (
														msg.fileType && msg.fileType.startsWith('image/') ? (
															// Render image if it's an image file
															<img
																src={`${LOCALHOST_URL}/uploads/${msg.fileUrl}`}
																alt={msg.fileName || 'Image'}
																style={{maxWidth: '100%',
																	maxHeight: '60%',
																	width: 'auto',
																	height: 'auto',
																	borderRadius: '10px' }}
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
													)}

												{/* Timestamps */}
												<div style={{ marginTop: '5px', fontSize: '11px', color: 'lightgray'}}>
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
												color: '#000000',
											}}>
												<span style={{ fontSize: '14px', color: '#000000', }}><b>{msg.username || 'Unknown'}</b></span>
												{' '}{formatDate(msg.sendTime)}
											</div>
											<Box sx={{
												padding: '10px', float: 'left', clear: 'both', textAlign: 'left', backgroundColor: '#d3d3d3',
												color: '#000000', borderRadius: '10px', width: '100%',
											}}>

												{/* Rendering both text and file if present */}
												{msg.content && (
													<Typography variant="body1" sx={{ marginBottom: msg.fileUrl ? '10px' : '0' }}>
														{msg.content}
													</Typography>
												)}

												{msg.fileUrl && (
														msg.fileType && msg.fileType.startsWith('image/') ? (
															// Rendering image, if image
															<img
																src={`${LOCALHOST_URL}/uploads/${msg.fileUrl}`}
																alt={msg.fileName || 'Image'}
																style={{  maxWidth: '100%',
																	maxHeight: '60%',
																	width: 'auto',
																	height: 'auto',
																	borderRadius: '10px' }}
															/>
														) : (
															// Non image file, gives download link
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
													)}
												{/* Timestamps */}
												<div style={{ marginTop: '5px', fontSize: '11px', color: '#000000' }}>
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