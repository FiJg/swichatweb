import React, {useEffect, useState} from 'react'
import {Alert, Box, Button, Chip, Divider, TextField} from '@mui/material'
import {AccountCircle, LockOpen} from '@mui/icons-material'
import {styled} from '@mui/material/styles'
import LoginIcon from '@mui/icons-material/Login'
import {Link} from 'react-router-dom'
import axios from 'axios'

const LOCALHOST_URL = 'http://localhost:8082'
const LOGIN_TOKEN_URL = LOCALHOST_URL + '/login'

const CssTextField = styled(TextField)({
    '& label.Mui-focused': {
        color: '#333333',
    },
    '& label': {
        color: '#333333',
    },
    '& .MuiInput-underline:after': {
        borderBottomColor: '#4CAF50'
    },
    '& input': {
        color: '#333333',
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: '#BDBDBD',
            borderRadius: '10px'
        },
        '&:hover fieldset': {
            borderColor: '#BDBDBD'
        },
        '&.Mui-focused fieldset': {
            borderColor: '#BDBDBD'
        },
    },
})

const LoginButton = styled(Button)({
    background: '#0066ff',
    color: '#FFFFFF',
    fontWeight: 'bold',
    '&:hover': {
        background: '#20487c',
    },
})

const SignUpButton = styled(Button)({
    transition: 'all .3s ease-in-out',
    background: '#E0E0E0',
    color: '#333333',
    borderRadius: '10px',
    ':hover': {
        background: '#D5D5D5',
        color: 'black',
        transform: 'scale(1.05)',
    },
})

const Login = (props) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const [validUsername, setValidUsername] = useState(true)
    const [validPassword, setValidPassword] = useState(true)

    const [loginButtonClicked, setLoginButtonClicked] = useState(false)

    const [loginError, setLoginError] = useState('')

    useEffect(() => {
        setValidUsername(username.length > 0)
        setValidPassword(password.length > 0)
    }, [username, password])

    function login(e) {
        e.preventDefault()
        setLoginButtonClicked(true)
        if (!validUsername || !validPassword) {
            return
        }
        // Volani backendu pro kontrolu jmena a hesla

        const loginBody = {
            username: username.trim(),
            password: password,
        }

        axios.post(LOGIN_TOKEN_URL, loginBody)
            .then(response => {
                props.setUserToken(response.data)
            })
            .catch(error => {
                try {
                    setLoginError(error.response.data)
                } catch (e) {
                    setLoginError('Error: nedá sa pripojit ku serveru')
                }
                setLoginButtonClicked(false)
            })
    }

    {/*  log in form */}
    return (
        <div style={{
            width: '100%',
            height: '100vh',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{
                width: '350px',
                padding: '50px 50px',
                backgroundColor: '#ffffff',
                borderRadius: '15px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-6em)'
            }}>

                <h2 style={{
                    color: '#333333',
                    textAlign: 'center',
                    marginBottom: '20px',
                    fontFamily: 'Play, sans-serif'
                }}>ChatApp Login</h2>
                <form onSubmit={login}>
                    {/* Username  */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        marginBottom: '15px'
                    }}>
                        <AccountCircle sx={{ color: '#333333', mr: 1, my: 0.5 }} />
                        <CssTextField
                            label="Username"
                            variant="outlined"
                            onChange={e => setUsername(e.target.value)}
                            fullWidth
                        />
                    </Box>
                    {/* Username Validation error */}
                    {!validUsername && loginButtonClicked ? (
                        <Alert variant="filled" severity="error"
                               sx={{
                                   backgroundColor: '#FFCDD2',
                                   color: '#D32F2F',
                                   marginBottom: '15px',
                                   borderRadius: '5px'
                               }}>
                            Username is required
                        </Alert>
                    ) : (
                        <Box sx={{ marginBottom: '15px' }}></Box>
                    )}
                    {/* Password Field */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        marginBottom: '15px'
                    }}>
                        <LockOpen sx={{ color: '#333333', mr: 1, my: 0.5 }} />
                        <CssTextField
                            label="Password"
                            type="password"
                            variant="outlined"
                            onChange={e => setPassword(e.target.value)}
                            fullWidth
                        />
                    </Box>
                    {/* Password Validation Error */}
                    {!validPassword && loginButtonClicked ? (
                        <Alert variant="filled" severity="error"
                               sx={{
                                   backgroundColor: '#FFCDD2',
                                   color: '#D32F2F',
                                   marginBottom: '15px',
                                   borderRadius: '5px'
                               }}>
                            Password is required
                        </Alert>
                    ) : (
                        <Box sx={{ marginBottom: '15px' }}></Box>
                    )}
                    {/* Login Error Message */}
                    {loginError && (
                        <Alert variant="filled" severity="error"
                               sx={{
                                   backgroundColor: '#FFCDD2',
                                   color: '#D32F2F',
                                   marginBottom: '15px',
                                   borderRadius: '5px'
                               }}>
                            {loginError}
                        </Alert>
                    )}
                    {/* Login Button */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '15px'
                    }}>
                        <LoginIcon sx={{ color: '#FFFFFF', mr: 1, my: 0.5 }} />
                        <LoginButton
                            type="submit"
                            variant="contained"
                            sx={{
                                borderRadius: 2,
                                width: '100%',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <span style={{ fontFamily: 'Play, sans-serif' }}>Log in</span>
                        </LoginButton>
                    </Box>
                </form>
                {/* Divider with OR Chip */}
                <Divider sx={{ marginTop: '15px', marginBottom: '15px' }}>
                    <Chip label="OR" variant="outlined" sx={{ color: '#333333', borderColor: '#BDBDBD' }} />
                </Divider>
                {/* Sign Up Link */}
                <Link to="/signup" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
                    <SignUpButton sx={{ width: '100%', padding: '10px 0' }}>
                        <span style={{ fontFamily: 'Play, sans-serif' }}>Sign up now</span>
                    </SignUpButton>
                </Link>
            </div>
        </div>
    )
}

export default Login
