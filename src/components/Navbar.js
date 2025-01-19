import React, { useState, useEffect } from 'react';
import {
	AppBar,
	Box,
	Avatar,
	Button,
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
import EmailIcon from '@mui/icons-material/Email';
import axios from 'axios';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';
import { Link, useNavigate } from 'react-router-dom';

const LogoutText = styled(Typography)({
	transition: 'background 0.3s, color 0.3s',
	':hover': {
		background: 'transparent',
	},
	paddingLeft: '2px',
	fontFamily: 'Play, sans-serif',
	color: '#333333',
})

const LogoutIconButton = styled(IconButton)({
	color: '#0066ff',
	'&:hover': {
		color: '#004bb5',
		background: 'transparent',
	},
})

const UploadAvatarButton = styled(IconButton)({
	color: '#0066ff',
	'&:hover': {
		color: '#004bb5',
		background: 'transparent',
	},
});


const Navbar = (props) => {
	const [avatar, setAvatar] = useState(props.user?.avatarUrl || null);
	const [avatarPreview, setAvatarPreview] = useState(null);

	// Fetching avatar URL when component mounts or the user changes
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
		formData.append('file', file);

		console.log("Username being used for avatar upload:", props.user.username);

		try {
			const response = axios.post(`http://localhost:8082/api/users/${props.user.username}/avatar`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			console.log('Avatar updated:', response.data);
			setAvatar(response.data.avatarUrl);
			setAvatarPreview(null);
		} catch (error) {
			console.error('Error updating avatar:', error);
			//alert('Failed to update avatar. Please try again.');
		}
	};

	const logout = () => {
		props.unsetUserToken();
	};


	const handleFileChange = (e) => {
		console.log("File selected");
		const file = e.target.files[0]; // Extracting file
		if (file) {
			console.log("File:", file);
			const fileUrl = URL.createObjectURL(file); //generating preview URL
			setAvatarPreview(fileUrl); //shows preview
			handleAvatarChange(file); // passimg file to handleAvatarChange
		}
	};


	return (
		<AppBar position="static" sx={{background: '#d0d0d0', borderBottom: 1, borderColor: '#BDBDBD'}} elevation={1}>
			<Toolbar>
				{/* chattapp heading */}
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<ChatIcon sx={{ color: '#0066ff', mr: 1 }} />
					<Typography variant="h6" component="div" sx={{ color: '#333333', fontFamily: 'Play, sans-serif' }}>
						ChatApp
					</Typography>
				</Box>
				{props.user ? (
					<Stack direction="row" spacing={2} marginLeft="auto" alignItems="center">
						{/* avatar upload  */}
						<Tooltip title="Change Avatar">
							<UploadAvatarButton component="label">
								<Avatar
									sx={{ bgcolor: '#0066ff',
										color: '#ffffff',
										width: 40,
										height: 40,}}
									src={avatarPreview || avatar || ''}
								>
									{!avatarPreview && !avatar && (
										<Typography variant="subtitle1" sx={{ fontFamily: 'Play, sans-serif' }}>
											{props.user.username.charAt(0).toUpperCase()}
										</Typography>
									)}
								</Avatar>
								{/* hidden file input */}
								<input
									type="file"
									accept="image/*"
									onChange={handleFileChange}
									style={{ display: 'none' }}
								/>
							</UploadAvatarButton>
						</Tooltip>

						{/*  log out */}
						<LogoutIconButton color="inherit" onClick={logout} aria-label="logout">
							<LogoutIcon />
							<LogoutText variant="button">Logout</LogoutText>
						</LogoutIconButton>
					</Stack>
				) : (
					<Stack direction="row" spacing={2} marginLeft="auto" alignItems="center">
						{/* failstate, user not logged in, showing login/signup links */}
						<Tooltip title="Log in">
							<Link to="/login" style={{ textDecoration: 'none' }}>
								<Button
									variant="contained"
									sx={{
										backgroundColor: '#0066ff',
										color: '#ffffff',
										fontWeight: 'bold',
										'&:hover': {
											backgroundColor: '#1b89ea',
										},
										borderRadius: '20px',
										textTransform: 'none',
										fontFamily: 'Play, sans-serif',
									}}
								>
									Log in
								</Button>
							</Link>
						</Tooltip>
						<Tooltip title="Sign Up">
							<Link to="/signup" style={{ textDecoration: 'none' }}>
								<Button
									variant="outlined"
									sx={{
										borderColor: '#0066ff',
										color: '#0066ff',
										fontWeight: 'bold',
										'&:hover': {
											backgroundColor: '#e3f2fd',
											borderColor: '#1b89ea',
										},
										borderRadius: '20px',
										textTransform: 'none',
										fontFamily: 'Play, sans-serif',
									}}
								>
									Sign Up
								</Button>
							</Link>
						</Tooltip>
					</Stack>
				)}
			</Toolbar>
		</AppBar>
	)
}

export default Navbar