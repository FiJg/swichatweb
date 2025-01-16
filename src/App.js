import './App.css'
import Home from './components/Home'
import Signup from './components/Signup'
import {Route, Routes} from 'react-router-dom'
import {useState} from 'react'
import Navbar from './components/Navbar'


function App() {
	
	const [user, setUser] = useState(getUserToken())
	
	function setUserToken(userToken) {
		localStorage.setItem('userToken', JSON.stringify(userToken))
		setUser(userToken)
	}
	
	function unsetUserToken() {
		localStorage.removeItem('userToken')
		setUser(null)
	}
	
	function getUserToken() {
		const userTokenStr = localStorage.getItem('userToken')
		
		let userToken = ''
		try {
			userToken = JSON.parse(userTokenStr)
		} catch (e) {
			console.error(e.message)
		}
		
		return userToken
	}
	
	return (
		<div>
			<Navbar user={user} unsetUserToken={unsetUserToken}/>
			<Routes>
				<Route path="/"
				       element={<Home user={user} setUserToken={setUserToken} unsetUserToken={unsetUserToken}/>}/>
				<Route path="/signup" element={<Signup/>}/>
			</Routes>
		</div>
	)
}

export default App
