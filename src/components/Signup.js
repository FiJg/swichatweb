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
        color: 'white',
    },
    '& label': {
        color: 'white',
    },
    '& .MuiInput-underline:after': {
        borderBottomColor: 'green',
    },
    '& input': {
        color: 'white',
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'grey',
            borderRadius: '10px'
        },
        '&:hover fieldset': {
            borderColor: 'white',
        },
        '&.Mui-focused fieldset': {
            borderColor: 'white',
        },
    },
})

const LoginButton = styled(Button)({
    background: '#9c49f3',
    color: 'black',
    fontWeight: 'bold',
})

const SignUpButton = styled(Button)({
    transition: 'all .2s ease-in-out',
    background: '#18181a',
    color: '#b9bbbd',
    borderRadius: '20px',
    ':hover': {
        background: '#0e0e0f',
        color: 'white',
        transform: 'scale(1.1)',
    },
})

const style = {
    position: 'absolute',
    top: '35%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    bgcolor: '#1f1f22',
    border: '2px solid #000',
    p: 2,
    color: 'white',
}

const Signup = (props) => {

    const [errorMessage, setErrorMessage] = useState('')
    const [registrationSuccessful, setRegistrationSuccessful] = useState(false)
    const [countdown, setCountdown] = useState(0)

    useEffect(() => {
        countdown > 0 && setTimeout(() => setCountdown(countdown - 1), 1000)
    }, [countdown])

    const [open, setOpen] = useState(false)
    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')

    const [validUsername, setValidUsername] = useState(true)
    const [validPassword, setValidPassword] = useState(true)
    const [validEmail, setValidEmail] = useState(true)

    const [loginButtonClicked, setLoginButtonClicked] = useState(false)

    useEffect(() => {
        setValidUsername(username.length > 0)
        setValidPassword(password.length > 0)
        setValidEmail(email.length > 0)
    }, [username, password, email])

    function signup(e) {
        e.preventDefault()
        setLoginButtonClicked(true)
        if (!validUsername || !validPassword || !validEmail) {
            return
        }

        const signupBody = {
            username: username,
            password: password,
            email: email,
        }

        axios.post(SIGNUP_URL, signupBody)
            .then(response => {
                //setUsername(response.data);
                setRegistrationSuccessful(true)
                setCountdown(3)
                setTimeout(() => {
                    handleClose()
                }, 2800)
                setTimeout(() => {
                    navigate('/')
                }, 3000)
                handleOpen()
            })
            .catch(error => {
                setErrorMessage(error.response.data)
                setRegistrationSuccessful(false)
                handleOpen()
            })
    }

    return (
        <div className="App">
            <Modal
                open={open}
                onClose={handleClose}
                aria-describedby="modal-modal-description"
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{timeout: 500}}
            >
                <Fade in={open}>
                    <Box sx={style}>
                        <IconButton
                            onClick={handleClose}
                            sx={{position: 'absolute', left: '1', right: '0', top: '0', bottom: '1', color: 'white'}}
                            style={{backgroundColor: 'transparent'}}
                        >
                            <Close></Close>
                        </IconButton>
                        {registrationSuccessful ? (
                            <div>
                                <Alert severity="success" variant="string"
                                       sx={{color: '#00ff66', justifyContent: 'center', fontSize: '100%'}}>Registration
                                    successful!</Alert>
                                <Typography id="modal-modal-description" sx={{mt: 1, textAlign: 'center'}}>
                                    Redirecting to login page in {countdown}s
                                </Typography>
                            </div>
                        ) : (
                            <div>
                                <Alert severity="error" variant="string" sx={{
                                    color: '#d64242',
                                    justifyContent: 'center',
                                    fontSize: '100%',
                                }}>{errorMessage}</Alert>
                            </div>
                        )}
                    </Box>
                </Fade>

            </Modal>
            <div className="gradient-background" style={{width: '100%', height: '100vh'}}>
                <div style={{
                    width: '300px',
                    margin: 'auto',
                    marginTop: '10%',
                    padding: '20px 40px',
                    backgroundColor: '#18181A',
                    borderRadius: '15px'
                }}>
                    <h2 className="MyFont">Sign up now!</h2>
                    <form onSubmit={signup}>

                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <AccountCircle sx={{color: 'white', mr: 1, my: 0.5}}/>
                            <CssTextField sx={{fontFamily: 'Play'}} label="Username"
                                          onChange={e => setUsername(e.target.value)}/>
                        </Box>
                        {!validUsername && loginButtonClicked ? (
                            <Alert variant="string" severity="error"
                                   sx={{color: '#d64242', marginLeft: '15px'}}>Required</Alert>
                        ) : (
                            <Box sx={{marginBottom: '15px'}}></Box>
                        )}

                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <LockOpen sx={{color: 'white', mr: 1, my: 0.5}}/>
                            <CssTextField label="Password" type="password" onChange={e => setPassword(e.target.value)}/>
                        </Box>
                        {!validPassword && loginButtonClicked ? (
                            <Alert variant="string" severity="error"
                                   sx={{color: '#d64242', marginLeft: '15px'}}>Required</Alert>
                        ) : (
                            <Box sx={{marginBottom: '15px'}}></Box>
                        )}

                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <LockOpen sx={{color: 'white', mr: 1, my: 0.5}}/>
                            <CssTextField label="Email" type="email" onChange={e => setEmail(e.target.value)}/>
                        </Box>
                        {!validEmail && loginButtonClicked ? (
                            <Alert variant="string" severity="error"
                                   sx={{color: '#d64242', marginLeft: '15px'}}>Required</Alert>
                        ) : (
                            <Box sx={{marginBottom: '15px'}}></Box>
                        )}

                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <LoginIcon sx={{color: 'white', mr: 1, my: 0.5}}/>
                            <LoginButton
                                disabled={registrationSuccessful}
                                type="submit"
                                variant="contained"
                                sx={{
                                    borderRadius: 2,
                                    width: 0.75,
                                }}
                            >
                                <div className="MyFont">Sign up</div>
                            </LoginButton>
                        </Box>
                    </form>
                    <Divider sx={{marginTop: '15px', marginBottom: '15px', borderBottomWidth: '50px'}}>
                        <Chip label="OR" variant="plain" sx={{color: 'white'}}/>
                    </Divider>
                    <Link to="/" style={{textDecoration: 'none'}}>
                        <SignUpButton>
                            <div className="MyFont">Log in</div>
                        </SignUpButton>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Signup