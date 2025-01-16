import React, {useEffect, useState} from 'react'
import {
    Alert,
    Backdrop,
    Box,
    Button,
    Chip,
    Divider,
    Fade,
    IconButton,
    Modal,
    TextField,
    Typography,
} from '@mui/material'
import {AccountCircle, Close, LockOpen} from '@mui/icons-material'
import {styled} from '@mui/material/styles'
import LoginIcon from '@mui/icons-material/Login'
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios'

const SIGNUP_URL = 'http://localhost:8082/api/signup'

const CssTextField = styled(TextField)({
    '& label.Mui-focused': {
        color: '#333333',
    },
    '& label': {
        color: '#333333',
    },
    '& .MuiInput-underline:after': {
        borderBottomColor: '#0066ff',
    },
    '& input': {
        color: '#333333',
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: '#BDBDBD',
            borderRadius: '10px',
        },
        '&:hover fieldset': {
            borderColor: '#757575',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#0066ff',
        },
    },
})


const SignUpButtonStyled = styled(Button)({
    background: '#0066ff',
    color: '#FFFFFF',
    fontWeight: 'bold',
    '&:hover': {
        background: '#1b89ea',
    },
})

const LoginButtonStyled = styled(Button)({
    transition: 'all 0.2s ease-in-out',
    background: '#E0E0E0',
    color: '#333333',
    borderRadius: '20px',
    ':hover': {
        background: '#D5D5D5',
        color: '#000000',
        transform: 'scale(1.05)',
    },
})


const modalStyle = {
    position: 'absolute',
    top: '35%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    bgcolor: '#ffffff',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    color: '#333333',
    borderRadius: '10px',
}

const Signup = (props) => {

    const navigate = useNavigate()

    //State vars
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')

    const [validUsername, setValidUsername] = useState(true)
    const [validPassword, setValidPassword] = useState(true)
    const [validEmail, setValidEmail] = useState(true)

    //state vars for form and feedback
    const [signupButtonClicked, setSignupButtonClicked] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [registrationSuccessful, setRegistrationSuccessful] = useState(false)
    const [countdown, setCountdown] = useState(0)

    //modal state
    const [open, setOpen] = useState(false)
    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    //countdown for redirection
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    //effect to validate inputs on change
    useEffect(() => {
        setValidUsername(username.length > 0)
        setValidPassword(password.length > 0)
        setValidEmail(email.length > 0)
    }, [username, password, email])

    //form submit
    function signup(e) {
        e.preventDefault()

        setSignupButtonClicked(true)
        if (!validUsername || !validPassword || !validEmail) {
            return
        }

        const signupBody = {
            username: username.trim(),
            password: password,
            email: email.trim(),
        }

        axios.post(SIGNUP_URL, signupBody)
            .then(response => {

                setRegistrationSuccessful(true)
                setCountdown(2.5)
                setTimeout(() => {
                    handleClose()
                }, 2000)
                setTimeout(() => {
                    navigate('/')
                }, 2700)
                handleOpen()
            })
            .catch(error => {
                if (error.response && error.response.data) {
                    setErrorMessage(error.response.data)
                } else {
                    setErrorMessage('Error: Could not connect to the server')
                }
                setRegistrationSuccessful(false)
                handleOpen() // Open the error modal
                setSignupButtonClicked(false)
            })
    }

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            {/* Modal for feedback messages */}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="signup-modal-title"
                aria-describedby="signup-modal-description"
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={open}>
                    <Box sx={modalStyle}>
                        <IconButton
                            onClick={handleClose}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                color: '#333333'
                            }}
                        >
                            <Close />
                        </IconButton>
                        {registrationSuccessful ? (
                            <div>
                                <Alert severity="success" variant="filled"
                                       sx={{
                                           backgroundColor: '#C8E6C9', // Light green background
                                           color: '#2E7D32', // Dark green text
                                           marginBottom: '15px',
                                           borderRadius: '5px'
                                       }}>
                                    You've been successfully registered.
                                </Alert>
                                <Typography id="signup-modal-description" sx={{ mt: 2, textAlign: 'center' }}>
                                    Redirecting to login page in {countdown}s.
                                </Typography>
                            </div>
                        ) : (
                            <div>
                                <Alert severity="error" variant="filled"
                                       sx={{
                                           backgroundColor: '#FFCDD2',
                                           color: '#D32F2F',
                                           marginBottom: '15px',
                                           borderRadius: '5px'
                                       }}>
                                    {errorMessage}
                                </Alert>
                            </div>
                        )}
                    </Box>
                </Fade>
            </Modal>

            {/* Signup Form Container */}
            <div style={{
                width: '350px',
                padding: '30px 40px',
                backgroundColor: '#ffffff',
                borderRadius: '15px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-100px)',
            }}>
                <h2 style={{
                    color: '#333333', // Dark text
                    textAlign: 'center',
                    marginBottom: '20px',
                    fontFamily: 'Play, sans-serif'
                }}>ChatApp Sign Up</h2>
                <form onSubmit={signup}>
                    {/* Username Field */}
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
                    {/* Username Validation Error */}
                    {!validUsername && signupButtonClicked ? (
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
                    {!validPassword && signupButtonClicked ? (
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

                    {/* Email Field */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        marginBottom: '15px'
                    }}>
                        <AccountCircle sx={{ color: '#333333', mr: 1, my: 0.5 }} />
                        <CssTextField
                            label="Email"
                            type="email"
                            variant="outlined"
                            onChange={e => setEmail(e.target.value)}
                            fullWidth
                        />
                    </Box>
                    {/* Email Validation Error */}
                    {!validEmail && signupButtonClicked ? (
                        <Alert variant="filled" severity="error"
                               sx={{
                                   backgroundColor: '#FFCDD2',
                                   color: '#D32F2F',
                                   marginBottom: '15px',
                                   borderRadius: '5px'
                               }}>
                            Email is required
                        </Alert>
                    ) : (
                        <Box sx={{ marginBottom: '15px' }}></Box>
                    )}

                    {/* Sign Up Button */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '15px'
                    }}>
                        <LoginIcon sx={{ color: '#FFFFFF', mr: 1, my: 0.5 }} />
                        <SignUpButtonStyled
                            disabled={registrationSuccessful}
                            type="submit"
                            variant="contained"
                            sx={{
                                borderRadius: 2,
                                width: '75%',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <span style={{ fontFamily: 'Play, sans-serif' }}>Sign Up</span>
                        </SignUpButtonStyled>
                    </Box>
                </form>
                {/* Divider or chip */}
                <Divider sx={{ marginTop: '15px', marginBottom: '15px' }}>
                    <Chip label="OR" variant="outlined" sx={{ color: '#333333', borderColor: '#BDBDBD' }} />
                </Divider>
                {/* Login Link */}
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
                    <LoginButtonStyled sx={{ width: '100%', padding: '10px 0' }}>
                        <span style={{ fontFamily: 'Play, sans-serif' }}>Log in</span>
                    </LoginButtonStyled>
                </Link>
            </div>
        </div>
    )
}

export default Signup