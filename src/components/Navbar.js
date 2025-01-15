import React, { useState, useEffect } from 'react';
import {
	AppBar,
	Avatar,
	IconButton,
	Stack,
	Toolbar,
	Tooltip,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material';
import {styled} from '@mui/material/styles'
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import axios from 'axios';



const Navbar = (props) => {
	const [avatar, setAvatar] = useState(props.user?.avatarUrl || null);
	const [avatarPreview, setAvatarPreview] = useState(null); // Initialize avatarPreview state

	// Fetch the avatar URL when the component mounts or when the user changes
	useEffect(() => {
		const fetchAvatar = async () => {
			if (props.user?.username) {
				try {
					const response = await axios.get(`http://localhost:8082/api/users/${props.user.username}/avatar`);
					if (response.data.avatarUrl) {
						setAvatar(response.data.avatarUrl);
					}
				} catch (error) {
					if (err.response && err.response.status === 404) {
					console.error('Error fetching avatar 404:', error);
					} else {
					console.error("Error fetching avatar:", error);
					}
				}
			}
		};

		fetchAvatar();
	}, [props.user]);


	const handleAvatarChange = async (file) => {
		const formData = new FormData();
		formData.append('file', file); // Append the file to the FormData


		console.log("Username being used for avatar upload:", props.user.username);

		try {
			const response = axios.post(`http://localhost:8082/api/users/${props.user.username}/avatar`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			console.log('Avatar updated:', response.data);
			setAvatar(response.data.avatarUrl);
			setAvatarPreview(null); // Clear preview after successful upload
		} catch (error) {
			console.error('Error updating avatar:', error);
			alert('Failed to update avatar. Please try again.');
		}
	};

	const logout = () => {
		props.unsetUserToken();
	};


	const handleFileChange = (e) => {
		console.log("File selected");
		const file = e.target.files[0]; // Extract the first selected file
		if (file) {
			console.log("File:", file);
			const fileUrl = URL.createObjectURL(file); // Generate preview URL
			setAvatarPreview(fileUrl); // Show a preview immediately
			handleAvatarChange(file); // Pass the file directly to handleAvatarChange
		}
	};

const LogoutText = styled(Typography)({
	transition: 'background 0.3s, color 0.3s',
	':hover': {
		background: 'transparent',
	},
	paddingLeft: '2px',
})

const LogoutIconButton = styled(IconButton)({
	color: '#999b9d',
	'&:hover': {
		color: 'white',
		background: 'transparent',
	},
})







	return (
		<AppBar position="static" sx={{background: '#18181a', borderBottom: 1, borderColor: '#999b9d'}} elevation={0}>
			<Toolbar>
				{props.user ? (
					<Stack direction="row" spacing={2} marginLeft="auto" alignItems="center">
						{/*  Username, pridat cevi */}



						{/* Avatar Upload Section */}
						<Tooltip title="Change Avatar">
							<IconButton component="label" sx={{ p: 0 }}>
								<Avatar
									sx={{ bgcolor: '#9c49f3', color: 'black', width: 40, height: 40 }}
									src={avatarPreview || avatar || props.user.avatarUrl || ''}
								>
									{!avatarPreview && !avatar && !props.user.avatarUrl && (
										<div className="MyFont">{props.user.username.charAt(0).toUpperCase()}</div>
									)}
								</Avatar>
								{/* Hidden file input */}
								<input
									type="file"
									accept="image/*"
									onChange={handleFileChange}
									style={{ display: 'none' }}
								/>
							</IconButton>
						</Tooltip>

						{/*  Log out */}
						<LogoutIconButton color="inherit" onClick={logout}>
							<LogoutText variant="button">
								<div className="MyFont">Odhlásiť sa</div>
							</LogoutText>
						</LogoutIconButton>
					</Stack>
				) : (
					<div></div>
				)}
			</Toolbar>
		</AppBar>
	)
}

export default Navbar