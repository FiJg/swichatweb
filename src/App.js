import './App.css'
import Home from './components/Home'
import Signup from './components/Signup'
import {Route, Routes} from 'react-router-dom'
import {useState, useEffect } from 'react';
import Navbar from './components/Navbar'
import MainChat from "./components/MainChat";
import Login from './components/Login';
import Menu from "./components/Menu";

function App() {
	
	const [user, setUser] = useState(getUserToken());    function isTokenExpired(token) {
		if (!token?.expiry) return true;
		return new Date(token.expiry) < new Date();
	}
	function setUserToken(userToken) {
		if (!userToken?.expiry) {
			console.error("Invalid token: Missing expiry date.");
			return;
		}
		console.log("Setting user token:", userToken); // Debugging log
		localStorage.setItem('userToken', JSON.stringify(userToken));
		setUser(userToken);
	}
	function unsetUserToken() {
		localStorage.removeItem('userToken')
		setUser(null)
	}

	function getUserToken() {
		const userTokenStr = localStorage.getItem('userToken');
		try {
			const userToken = JSON.parse(userTokenStr);
			if (!userToken || isTokenExpired(userToken)) {
				console.warn("Token expired or invalid.");
				localStorage.removeItem('userToken');
				return null;
			}
			return userToken;
		} catch (e) {
			console.error("Invalid token format:", e.message);
			localStorage.removeItem('userToken');
			return null;
		}
	}
	function isTokenExpired(token) {
		if (!token?.expiry) return true;
		return new Date(token.expiry) < new Date();
	}

	useEffect(() => {
		if (!user) return;

		const interval = setInterval(() => {
			if (isTokenExpired(user)) {
				console.warn("Token expired during session.");
				unsetUserToken();
			}
		}, 60 * 1000);

		return () => clearInterval(interval);
	}, [user]);



	return (
		<div>
			<Navbar user={user} unsetUserToken={unsetUserToken} />
			<Routes>
				<Route
					path="/"
					element={<Home user={user} setUserToken={setUserToken} unsetUserToken={unsetUserToken} />}
				/>
				<Route path="/signup" element={<Signup />} />
				<Route path="/main-chat" element={<MainChat />} />
				<Route path="/login" element={<Login setUserToken={setUserToken} />} />
				<Route
					path="/menu"
					element={<Menu user={user} unsetUserToken={unsetUserToken} />}
				/>
			</Routes>
		</div>
	);
}

export default App;