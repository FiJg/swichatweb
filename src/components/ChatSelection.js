import React, {useEffect, useState} from 'react'
import {Avatar, Box, Grid, IconButton, Tab, Tabs, Tooltip, Typography} from '@mui/material'
import {styled} from '@mui/material/styles'
import AddCommentIcon from '@mui/icons-material/AddComment'
import axios from 'axios'
import {AddAlarm, AddModerator, PostAddOutlined, RemoveCircle} from "@mui/icons-material";

const LOCALHOST_URL = 'http://localhost:8082'

const ChatTabs = styled(Tabs)({
	'& .MuiTabs-indicator': {
		backgroundColor: 'transparent',
	},
	'& .MuiTab-root.Mui-selected': {
		backgroundColor: '#2b253c !important',
		color: 'white',
		
	},
	'& .MuiButtonBase-root.MuiTab-root': {
		borderRadius: 10,
		':hover': {
			backgroundColor: '#302f32',
		},
	},
})

const ChatSelection = (props) => {
	const [rooms, setChatRooms] = useState([])
	
	useEffect((e) => {
		fetchChatRooms(e)
	}, [])
	
	async function fetchChatRooms(e) {
		const url = LOCALHOST_URL + '/chatrooms'
		const params = new URLSearchParams([['username', props.user.username]])
		try {
			await axios.get(url, {params})
			           .then(async (result) => {
						   setChatRooms([]);
						   
				           result.data.forEach(i => setChatRooms((rooms) => [...rooms, {
					           id: i.id,
					           name: i.name,
					           messages: i.messages,
				           }]))
				           
				           try {
					           await props.handleChatChange(e, result.data[0]?.id)
				           } catch (e) {
					           console.info('No chats available!')
				           }
				
				           try {
					           result.data.forEach(i => {
						           let msgList = []
						           i.messages.forEach(j => msgList.push(j))
						
						           props.privateChats.set(i.id, msgList)
						           props.setPrivateChats(new Map(props.privateChats))
					           })
				           } catch (e) {
					           console.error(e)
					           console.info('No messages available!')
				           }
				           props.setIsLoading(false)
			           })
		} catch (e) {
			console.info('Error in fetching chat rooms!')
		}
	}
	
	function addGroupChat(e) {
		const name = prompt('Enter the name of the group chat')
		let users = prompt('Enter the usernames of the users you want to add to the group chat, separated by commas')
		
		if(name.length === 0 || users.length === 0) {
			alert('Group chat name and/or users cannot be empty!')
			return;
		}
		
		users = users.split(/\s*,\s*/)
		
		axios
			.post(LOCALHOST_URL + '/api/chatroom/create', {
				name: name,
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
					reqUserId: props.user.id, // Current logged-in user's ID
					userName: usernameToAdd.trim(), // User to be added
					roomId: chatroomID, // Current active chatroom ID
			})
			.then((response) => {
					console.log(`User "${usernameToAdd}" added successfully to chatroom.`);
					alert(`User "${usernameToAdd}" was successfully added to the chatroom.`);
					fetchChatRooms(e); // Refresh chatrooms after adding
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
				fetchChatRooms(e); // Refresh chatrooms after removing
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
				<>Loading...</>
			) : (
				<Box
					sx={{
						bgcolor: '#1b1b1d', position: 'absolute', left: '0', right: '1',
						padding: '10px', borderRight: 1, borderColor: '#999b9d', height: 'calc(100% - 65px - 20px)',
						...(props.isSmallRes === true && {
							paddingRight: '0px',
							width: '70px',
						}),
						...(props.isSmallRes === false && {
							width: '300px',
						}),
					}}
				>
					<Grid container direction="row" justifyContent="space-between" alignItems="center">
						{!props.isSmallRes ? (
							<Grid item>
								<Typography variant="h5">
									Chats
								</Typography>
							</Grid>
						) : (
							<></>
						)}
						<Grid item sx={{
							...(props.isSmallRes === true && {
								marginLeft: 'auto',
								marginRight: 'auto',
							}),
						}}
						>
							<Tooltip title="Create a new chatroom" placement="left" arrow>
								<IconButton sx={{paddingLeft: '0px'}} onClick={addGroupChat}>
									<AddModerator sx={{color: 'white'}}></AddModerator>

								</IconButton>
							</Tooltip>
							<Tooltip title="Add user to the chatroom" placement="left" arrow>
								<IconButton sx={{paddingLeft: '0px'}} onClick={addUsersToGroupChat}>
									<AddCommentIcon sx={{color: 'white'}}></AddCommentIcon>
								</IconButton>
							</Tooltip>
							<Tooltip title="Remove user from the chatroom" placement="left" arrow>
								<IconButton sx={{paddingLeft: '0px'}} onClick={removeUsersFromGroupChat}>
									<RemoveCircle sx={{color: 'white'}}></RemoveCircle>
								</IconButton>
							</Tooltip>
						</Grid>
					</Grid>
					<ChatTabs
						value={props.activeChat.id}
						onChange={props.handleChatChange}
						orientation="vertical"
					>
						{rooms.map((room) =>
							<Tab
								key={room.id}
								value={room.id}
								label={!props.isSmallRes ? (
									room.name
								) : (
									''
								)}
								sx={{color: 'white', justifyContent: 'left', paddingLeft: '10px'}}
								icon={<Avatar sx={{bgcolor: '#9c49f3', color: 'black'}}>
									<div className="MyFont">{room.name.charAt(0).toUpperCase()}</div>
								</Avatar>}
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