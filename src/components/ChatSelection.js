import React, {useEffect, useState} from 'react'
import {AppBar, Avatar, Box, Badge, Grid, IconButton, Tab, Tabs, Tooltip, Typography, styled} from '@mui/material'
import AddCommentIcon from '@mui/icons-material/AddComment'
import {AddAlarm, AddModerator, PostAddOutlined, RemoveCircle} from "@mui/icons-material";

import axios from 'axios'

const LOCALHOST_URL = 'http://localhost:8082'


const ChatTabs = styled(Tabs)({
	'& .MuiTabs-indicator': {
		display: 'none',
	},
	'& .MuiTab-root': {
		borderRadius: 10,
		textTransform: 'none',
		fontFamily: 'Play, sans-serif',
		justifyContent: 'flex-start',
		alignItems: 'center',
		color: '#333333',
		padding: '10px 20px',
		minHeight: '50px',
		'&:hover': {
			backgroundColor: '#e3f2fd',
			color: '#0066ff',
		},
	},
	'& .MuiTab-root.Mui-selected': {
		backgroundColor: '#0066ff',
		color: '#ffffff',
	},

})


const ActionIconButton = styled(IconButton)({
	color: '#0066ff',
	'&:hover': {
		color: '#004bb5',
		backgroundColor: 'transparent',
	},
});

const InitialsTypography = styled(Typography)({
	fontFamily: 'Play, sans-serif',
	fontWeight: 'bold',
});

const NotificationBadge = styled(Badge)(({ theme }) => ({
	'& .MuiBadge-badge': {
		backgroundColor: '#ff1744',
		color: 'white',
		boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
	},
}));


const ChatSelection = (props) => {
	const [rooms, setChatRooms] = useState([])

	const [activeChat, setActiveChat] = useState(null);
	const activeChatId = activeChat?.id;

	useEffect((e) => {
		fetchChatRooms(e);
		console.log('Current notifications state:', props.notifications);
	}, [props.notifications])

	async function fetchChatRooms(e) {
		const url = LOCALHOST_URL + '/chatrooms'
		const params = new URLSearchParams([['username', props.user.username]])

		try {
			const response = await axios.get(url, { params });
			const chatRooms = response.data.map((room) => ({
				id: room.id,
				name: room.name,
				messages: room.messages,
			}));
			setChatRooms(chatRooms);

			// Set active chat only if none is selected
			if (!props.activeChat && chatRooms.length > 0) {
				await props.handleChatChange(e, chatRooms[0]?.id);
			}

			props.setPrivateChats(new Map(chatRooms.map((room) => [room.id, room.messages || []])));
			props.setIsLoading(false);
		} catch (error) {
			console.error('Error fetching chat rooms:', error);
		}
	}
	
	function addGroupChat(e) {
		const name = prompt('Enter the name of the group chat')
		let users = prompt('Enter the usernames of the users you want to add to the group chat, separated by commas')

		if (!name || name.trim().length === 0 || !users || users.trim().length === 0) {
			alert('Group chat name and/or users cannot be empty!')
			return;
		}
		
		users = users.split(/\s*,\s*/)
		
		axios
			.post(LOCALHOST_URL + '/api/chatroom/create', {
				name: name.trim(),
				isGroup: true,
				joinedUserNames: users,
				createdBy: props.user.id,
			})
			.then((result) => fetchChatRooms(e))
			.catch((e) => console.error(e))
	}
	function addUsersToGroupChat(e) {
		const usernameToAdd = prompt('Enter the username of the user you want to add to the group chat:');

		// Validate input
		if (!usernameToAdd || usernameToAdd.trim().length === 0) {
			alert('Please enter a valid username.');
			return;
		}
		const chatroomID = props.activeChat?.id;

		if (!chatroomID) {
			alert('No active chatroom selected. Please select a chatroom first.');
			return;
		}

		axios
			.post(`${LOCALHOST_URL}/api/chatroom/assign/${chatroomID}`, {
					reqUserId: props.user.id, // Current logged in user's ID
					userName: usernameToAdd.trim(), // User to be added
					roomId: chatroomID, // Current active chatroomID
			})
			.then((response) => {
					console.log(`User "${usernameToAdd}" added successfully to chatroom.`);
					alert(`User "${usernameToAdd}" was successfully added to the chatroom.`);
					fetchChatRooms(e); // Refreshing chatrooms after adding
			})
			.catch((error) => {
					console.error(`Failed to add user "${usernameToAdd}":`, error);
					alert(error.response?.data || `Failed to add user "${usernameToAdd}" to the chatroom.`);
			});
	}

	function removeUsersFromGroupChat(e) {
		const usernameToRemove = prompt('Enter the username of the user you want to remove from the group chat:');

		if (!usernameToRemove || usernameToRemove.trim().length === 0) {
			alert('Please enter a valid username.');
			return;
		}

		const chatroomID = props.activeChat?.id;

		if (!chatroomID) {
			alert('No active chatroom selected. Please select a chatroom first.');
			return;
		}

		if (usernameToRemove === props.user.username) {
			alert('You cannot remove yourself from the chatroom.');
			return;
		}


		axios
			.post(`${LOCALHOST_URL}/api/chatroom/deleteUserFromChatroom/${chatroomID}`, {
				reqUserId: props.user.id,
				userName: usernameToRemove.trim(),
				roomId: chatroomID,
			})
			.then((response) => {
				console.log(`User "${usernameToRemove}" removed successfully from the chatroom.`);
				alert(`User "${usernameToRemove}" was successfully removed from the chatroom.`);
				fetchChatRooms(e); // Refreshing chatrooms after removing
			})
			.catch((error) => {
				if (error.response?.status === 403) {
					alert('Users cannot be removed from public chatrooms.');
				} else {
					console.error(`Failed to remove user "${usernameToRemove}":`, error);
					alert(error.response?.data || `Failed to remove user "${usernameToRemove}" from the chatroom.`);
				}
			});
	}


	return (
		<div>
			{props.isLoading ? (
				<Typography variant="h6" sx={{ color: '#333333', fontFamily: 'Play, sans-serif', textAlign: 'center', mt: 4 }}>
					Loading chatrooms...
				</Typography>
			) : (
				<Box
					sx={{
						bgcolor: '#D0D0D0FF',
						position: 'absolute',
						left: '0',
						right: '0',
						top: '65px',
						bottom: 0,
						padding: '20px',
						borderRight: 1,
						borderColor: '#BDBDBD',
						height: 'calc(100% - 65px - 40px)',
						overflowY: 'auto',
						...(props.isSmallRes === true && {
							paddingRight: '10px',
							width: '70px',
						}),
						...(props.isSmallRes === false && {
							width: '300px',
						}),
					}}
				>
					<Grid container direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
						{!props.isSmallRes && (
							<Grid item>
								<Typography variant="h5" sx={{ color: '#333333', fontFamily: 'Play, sans-serif' }}>
									ChatRooms
								</Typography>
							</Grid>
						)}
						<Grid item>
							<Tooltip title="Create a new chatroom" placement="left" arrow>
								<ActionIconButton onClick={addGroupChat}>
									<AddModerator />
								</ActionIconButton>
							</Tooltip>
							<Tooltip title="Add user to the chatroom" placement="left" arrow>
								<ActionIconButton onClick={addUsersToGroupChat}>
									<AddCommentIcon />
								</ActionIconButton>
							</Tooltip>
							<Tooltip title="Remove user from the chatroom" placement="left" arrow>
								<ActionIconButton onClick={removeUsersFromGroupChat}>
									<RemoveCircle />
								</ActionIconButton>
							</Tooltip>
						</Grid>
					</Grid>
					<ChatTabs
						value={props.activeChat?.id || false} // Preventing undefined errors
						onChange={(e, newChatId) => {
							console.log('Switching to chatRoomId:', newChatId);
							props.handleChatChange(e, newChatId);
							setActiveChat(rooms.find((room) => room.id === newChatId));
						}}
						orientation="vertical"
						variant="scrollable"
						scrollButtons="auto"
						sx={{ height: 'calc(100% - 80px)', bgcolor: '#D0D0D0FF',  width: '100%' }}
					>
						{rooms.map((room) =>
							<Tab
								key={room.id}
								value={room.id}
								label={
									!props.isSmallRes ? (
										<NotificationBadge
											color="error"
											variant={props.notifications[room.id] ? "dot" : "standard"}
											invisible={!props.notifications[room.id]}
										>
											{room.name}
										</NotificationBadge>
									) : (
										''
									)
								}
								sx={{
									alignItems: 'center',
									justifyContent: 'flex-start',
									color: '#333333',
									paddingLeft: '10px',
									mb: 1,
									display: 'flex'
								}}
								icon={
									<Avatar sx={{ bgcolor: '#0066ff', color: '#ffffff', width: 30, height: 30 }}>
										<InitialsTypography variant="subtitle2">
											{room.name ? room.name.charAt(0).toUpperCase() : ''}
										</InitialsTypography>
									</Avatar>
								}
								iconPosition="start"
							/>,
						)}
					</ChatTabs>
				</Box>
			)}
		</div>
	)
}

export default ChatSelection