import { showAndHidePopup } from "./App.jsx";

const prefix = "/call-them"

const configObj = {
    tokenLocalKey: "gn08724yn8f938fh2n82hdiu",
    loginSessionKey: "apoijdnjcn3297gt8yi",
    
    sessionIdKey: "iuhd938h3bdipdhqiuha",
    sessionNameKey: "a6c43s75vi67no8pm9",
    sessionUsernameKey: "diuhi3qih89hbu929d",

    homePage: `${prefix}/`,
    loginPage: `${prefix}/login`,
    registerPage: `${prefix}/register`,
    profilePage: `${prefix}/profile`,

    backendAPI: "https://master-forky.up.railway.app",
    getBackendApiUrl: (suffix) => {return configObj.backendAPI + suffix}
}

export function showPopup(text) {showAndHidePopup(text)}

export default configObj;