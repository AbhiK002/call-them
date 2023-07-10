import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import axios from 'axios'

import components from './components/components.jsx'
import config from './config.js'
import './App.css'

export function showAndHidePopup(text) {
  const popup = document.getElementById("pop-up");
  popup.innerText = text;
  popup.style.opacity = "1";
  setTimeout(() => {
      popup.style.opacity = "0";
  }, 3000);
}

function TopBar({ userInfo }) {
  return <div className='top-bar'>
    <div className='top-logo' onClick={() => {location.href = '/'}}>
      <img className='logo-img' src='./logo.svg' height={32} alt='[LOGO]' />
      <span className='logo-text'>CallThem</span>
    </div>

    <div className='top-user-div'>
      <span className='user-name'>{userInfo.username ? userInfo.username : "Login"}</span>
      <button className='user-button' onClick={() => {location.href = '/profile'}}>
        <img height={36} src='./user.svg' />
      </button>
    </div>
  </div>
}

function setLoginSession(val) {
  sessionStorage.setItem(config.loginSessionKey, val)
}

function getLoginSession() {
  return sessionStorage.getItem(config.loginSessionKey)
}

function getSessionUser() {
  let getVal = sessionStorage.getItem.bind(sessionStorage);
  return {
    name: getVal(config.sessionNameKey),
    username: getVal(config.sessionUsernameKey),
    _id: getVal(config.sessionIdKey)
  }
}

function setSessionUser(name, username, _id) {
  let setVal = sessionStorage.setItem.bind(sessionStorage);

  setVal(config.sessionNameKey, name);
  setVal(config.sessionUsernameKey, username);
  setVal(config.sessionIdKey, _id);
}

function clearSessionStorage() {
  sessionStorage.clear()
}

function App() {
  let [currentUser, setCurrentUser] = useState({
    name: null,
    username: null,
    _id: null
  })

  function changeCurrentUser(name, username, _id) {
    setCurrentUser({
      name: name,
      username: username,
      _id: _id
    })
  }

  let sessionActive = getLoginSession();

  useEffect(() => {
    sessionActive = getLoginSession();

    if (sessionActive) {
      const sessionUser = getSessionUser();
      changeCurrentUser(sessionUser.name, sessionUser.username, sessionUser._id);
      return
    }

    const token = localStorage.getItem(config.tokenLocalKey);
    
    if(token) {
      // validate token to auto login
      axios.post(config.getBackendApiUrl("/autologin"), {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then((res) => {
        if(res.data.valid) {
          const user = res.data.user;

          setLoginSession(true);
          setSessionUser(user.name, user.username, user._id);
          changeCurrentUser(user.name, user.username, user._id);
        }
        else {
          clearSessionStorage();
        }
      }).catch((err) => {
        clearSessionStorage();
      })
    }
    else {
      clearSessionStorage();
    }
  }, [])

  sessionActive = getLoginSession();

  return <>
    <div id='pop-up'></div>
    <TopBar userInfo={currentUser} />
    <>
      <Routes>
        <Route path='/' Component={() => {return <components.home userDetails={currentUser} />}} />
        <Route path='/profile' Component={
            sessionActive 
            ? () => {return <components.profile userDetails={currentUser} />}
            : () => {location.href = "/login"; return null}
        } />
        <Route path='/login' Component={
          sessionActive 
          ? () => {location.href = "/"; return null}
          : () => {return <components.loginRegister isRegistering={false}/>}} />
        <Route path='/register' Component={
          sessionActive 
          ? () => {location.href = "/"; return null} 
          : () => {return <components.loginRegister isRegistering={true}/>}} />
        <Route path='/*' Component={() => {
          return <span style={{textAlign: 'center', marginTop: "1rem"}}>
            ERROR 404, that webpage is a myth, a legend.<br />
            Maybe try using the buttons instead of changing the URL :{")"}</span>
          }} />
      </Routes>
    </>
  </>
}

export default App
