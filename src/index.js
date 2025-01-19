import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import {BrowserRouter, HashRouter} from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles';


const theme = createTheme({
	palette: {
		primary: {
			main: '#d2d2d2',
		},
		secondary: {
			main: '#0066ff',
		},
	},
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<ThemeProvider theme={theme}>
		<HashRouter>
			<App />
		</HashRouter>
	</ThemeProvider>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
