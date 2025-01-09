import React from 'react'
import {AppBar, Avatar, IconButton, Stack, Toolbar, Tooltip, Typography, useMediaQuery, useTheme} from '@mui/material'
import {styled} from '@mui/material/styles'


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

const Navbar = (props) => {
	console.log('Navbar props.user:', props.user);
	function logout() {
		props.unsetUserToken()
	}

	return (
		<AppBar position="static" sx={{background: '#18181a', borderBottom: 1, borderColor: '#999b9d'}} elevation={0}>
			<Toolbar>
				{props.user ? (
					<Stack direction="row" spacing={2} marginLeft="auto" alignItems="center">
						{/*  Username, pridat cevi */}

						<Avatar sx={{bgcolor: '#9c49f3', color: 'black'}}>
							<div className="MyFont">{props.user.username.charAt(0).toUpperCase()}</div>
						</Avatar>

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