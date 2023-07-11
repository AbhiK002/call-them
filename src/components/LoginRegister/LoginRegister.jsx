import config, {showPopup} from '../../config.js';
import axios from 'axios'
import './loginregister.css'

function login(username, password) {
    let redirect = false;
    axios.post(config.getBackendApiUrl("/login"), {username: username, password: password}).then((res) => {
        if(res.data.valid){
            const token = res.data.token;
            localStorage.setItem(config.tokenLocalKey, token);
            showPopup("Login Successful");
            redirect = true;
        }
        else {
            showPopup("Login failed" + res.data.message);
            return;
        }
    }).catch((err) => {
        showError(err.response ? err.response.data.message : ("unknown error " + err.message));
        return;
    }).finally(() => {
        if (redirect != true) return;
        setTimeout(() => {
            document.location.href = config.homePage
        }, 2000);
    })
}

function register(name, username, password) {
    let redirect = false

    axios.post(config.getBackendApiUrl("/register"), {name: name, username: username, password: password}).then((res) => {
        if(res.data.valid){
            const token = res.data.token;
            if(token){
                localStorage.setItem(config.tokenLocalKey, token);
                showPopup("Registered Successfully");
                redirect = "/"
            }
            else {
                showPopup("Please Login Now");
                redirect = "login"
            }
        }
        else {
            showError("Registration failed: Try again later");
            return;
        }
    }).catch((err) => {
        if(err.response){
            showError(err.response.data.message);
            return;
        }
        showError("Some Error Occurred: Refresh the page");
        return;
    }).finally(() => {
        if(redirect == "login") {
            setTimeout(() => {
                document.location.href = config.loginPage;
            }, 1400);
        }
        else if(redirect == "/") {
            setTimeout(() => {
                document.location.href = config.homePage;
            }, 2000);
        }
    })    
}

function showError(text) {
    const errorOutput = document.getElementById("error-output");
    errorOutput.innerText = text;
    errorOutput.style.visibility = "visible";
}

function hideError() {
    const errorOutput = document.getElementById("error-output");
    errorOutput.innerText = "hmmmmm";
    errorOutput.style.visibility = "hidden";
}

function validateInputs(isRegistering) {
    hideError();

    let nameField = null; let name = null;
    if (isRegistering) {
        nameField = document.getElementById("name-input");
        name = nameField.value.trim();
    }
    const usernameField = document.getElementById("username-input");
    const passwordField = document.getElementById("password-input");

    const username = usernameField.value.trim();
    const password = passwordField.value;
    
    if(isRegistering) {
        if(name.length < 2 || name.length > 64) {
            showError("Your name must have at least 2 characters");
            return;
        }
    }
    
    if(username.length < 5 || username.length > 32) {
        showError("Your username must have at least 5 characters (max 32)");
        return;
    }
    if(username.match(/^.* .*$/)) {
        showError("Your username cannot contain spaces")
        return;
    }

    if(password.length < 8 || password.length > 256) {
        showError("Your password must have at least 8 characters (max 256)");
        return;
    }
    
    if(isRegistering) {
        register(name, username, password);
        }
    else {
        login(username, password);
        }
}

export function LoginRegister({ isRegistering }) {
    return <div className="login-reg-content">
        <h2 className="login-reg-title">{isRegistering ? "Register" : "Login"}</h2>
        <form onSubmit={(e) => {
            e.preventDefault()
            validateInputs(isRegistering)
        }} className='login-reg-form'>
            {
                isRegistering ? <>
                    <label htmlFor="name">Name: </label>
                    <input type="text" name="name" id="name-input" />
                </> : null
            }
            <label htmlFor="username">Username: </label>
            <input type="text" name="username" id="username-input" />
            <label htmlFor="password">Password: </label>
            <input type="password" name="password" id="password-input" />
            <p id='error-output'></p>
            <div className="login-reg-buttons-div">
                <button type="submit" className="login-reg-button">{isRegistering ? "Register" : "Login"}</button>
                <button type="reset" className="form-reset-button secondary-button" onClick={hideError}>Reset</button>
                <button type='button' className='go-to-login-reg-button third-type-button' onClick={(e) => {
                    e.preventDefault();
                    document.location.href = isRegistering ? config.loginPage : config.registerPage;
                }}>{isRegistering ? "Login" : "Register"} instead</button>
            </div>
        </form>
    </div>
}