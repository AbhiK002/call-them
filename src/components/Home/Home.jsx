import { useEffect, useState } from "react";
import axios from 'axios';
import config, { showPopup } from "../../config";
import './home.css'

function mapContactListToDisplay(currentContactsList, changeViewFunction) {
    if (currentContactsList != null) {
        if (currentContactsList.length > 0 && currentContactsList[0] == "loading"){
            return <span id="contacts-list-placeholder">Loading...</span>
        }
        if (currentContactsList.length > 0 && currentContactsList[0] == "loggedOut"){
            return <span id="contacts-list-placeholder" style={{
                cursor: "pointer"
            }} onClick={() => {
                document.location.href = config.loginPage
            }}>Please login to view contacts</span>
        }
        if (currentContactsList.length == 0){
            return <span id="contacts-list-placeholder">It's all empty here, create some contacts.</span>
        }

        return currentContactsList.map((contact, index) => {
            const name = contact.name;

            return <div className="contacts-list-item" key={index} onClick={() => {
                changeViewFunction(contact, false);
            }}>
                <span className="contact-name">{name}</span>
            </div>
    })}
    else return <span id="contacts-list-placeholder">
            Something isn't working... Please refresh/relogin.
        </span>
}

function showFormError(text) {
    const errorEle = document.getElementById("contact-form-error");
    errorEle.innerText = text;
    errorEle.style.opacity = "1";
}
function hideFormError() {
    const errorEle = document.getElementById("contact-form-error");
    errorEle.style.opacity = "0";
}

const validateContactForm = (nameInputID, numberInputID) => {
    hideFormError();
    const nameInput = document.getElementById(nameInputID);
    const numberInput = document.getElementById(numberInputID);

    let name = nameInput.value.trim();
    let number = numberInput.value.trim();

    if (name.length < 1 || name.length > 32){
        showFormError("Name must be 1 to 32 characters long")
        return false;
    }
    
    if (!(/^[()+ \-\d#\*]{0,64}$/gm.test(number))) {
        if(number.length > 64){
            showFormError("Phone number too long (max 64 chars)");
            return false;
        }
        showFormError("Allowed symbols in phone number are  +-()#* 0-9")
        return false;
    }

    return [name, number]
}

function NewContactForm({ userDetails, changeViewFunction, syncContacts }) {
    const addContactRequest = () => {
        let ret = validateContactForm("new-name-input", "new-number-input");

        if(!ret) return;
        const [name, number] = ret;

        const user_id = userDetails._id;
        const token = localStorage.getItem(config.tokenLocalKey);
        let userNotLoggedIn = false;

        if (token != null) {
            axios.post(config.getBackendApiUrl(`/add-contact/${user_id}`), {
                name: name,
                ph_num: number
            }, {
                headers: {Authorization: `Bearer ${token}`}
            })
            .then((res) => {
                if (res.data.valid) {
                    showPopup("Contact added");
                    syncContacts();
                    changeViewFunction({})
                }
                else {
                    showFormError("Contact could not be added");
                }
            })
            .catch((err) => {
                showFormError("Contact could not be added")
            })
        }
        else {
            showPopup("Please login")
            userNotLoggedIn = true;
        }
        if(userNotLoggedIn) {
            setTimeout(() => {
                document.location.href = config.loginPage
            }, 1200);
        }
    }

    return <div className="new-contact-form">
        <h3 className="contact-card-title">New Contact</h3>
        <span className="contact-preview-details">
            <p className="contact-preview-name">
                Name: <input type="text" id="new-name-input" />
            </p>
            <p className="contact-preview-number">
                Number: <input type="tel" id="new-number-input" />
            </p>
        </span>
        <span id="contact-form-error">|</span>
        <div className="contact-related-buttons">
            <button type="button" className="add-new-contact-button" onClick={addContactRequest}>Add</button>
            <button type="button" className="cancel-contact-button secondary-button" onClick={() => {
                changeViewFunction({})
            }}>Cancel</button>
        </div>
    </div>
}

function EditContactForm({contactDetails, changeViewFunction, syncContacts}) {
    const editContactRequest = () => {
        let ret = validateContactForm("name-input", "number-input");

        if(!ret) return;
        const [name, number] = ret;

        const _id = contactDetails._id;
        const token = localStorage.getItem(config.tokenLocalKey);
        let userNotLoggedIn = false;

        if (token != null) {
            axios.put(config.getBackendApiUrl(`/update-contact/${_id}`), {
                update: {
                    name: name,
                    ph_num: number
                }
            }, {
                headers: {Authorization: `Bearer ${token}`}
            })
            .then((res) => {
                if (res.data.valid) {
                    showPopup("Contact updated");
                    syncContacts();
                    changeViewFunction(res.data.updated, false);
                }
                else {
                    showFormError("Contact could not be updated");
                }
            })
            .catch((err) => {
                showFormError("Contact could not be updated")
            })
        }
        else {
            showPopup("Please login")
            userNotLoggedIn = true;
        }
        if(userNotLoggedIn) {
            setTimeout(() => {
                document.location.href = config.loginPage
            }, 1200);
        }
    }

    return <>
        <h3 className="contact-card-title">Edit Contact</h3>
        <span className="contact-preview-details">
            <p className="contact-preview-name">
                Name: <input type="text" id="name-input" defaultValue={contactDetails.name} />
            </p>
            <p className="contact-preview-number">
                Number: <input type="tel" id="number-input" defaultValue={contactDetails.ph_num} />
            </p>
        </span>
        <span id="contact-form-error">|</span>
        <div className="contact-related-buttons">
            <button className="save-contact-button" onClick={editContactRequest}>Save</button>
            <button className="cancel-contact-button secondary-button" onClick={() => {
                changeViewFunction(contactDetails, false);
            }}>Cancel</button>
        </div>
    </>
}

function PreviewPaneDiv({ contactDetails, userDetails, changeViewFunction, syncContacts }) {
    if (contactDetails._id == "new") {
        return <NewContactForm userDetails={userDetails} changeViewFunction={changeViewFunction} syncContacts={syncContacts} />
    }
    else if (contactDetails._id != null) { // view or edit
        if(contactDetails.editMode) { // edit mode
            return <EditContactForm contactDetails={contactDetails} changeViewFunction={changeViewFunction} syncContacts={syncContacts} />
        }

        // view mode
        const deleteContactRequest = () => {    
            const _id = contactDetails._id;
            const token = localStorage.getItem(config.tokenLocalKey);
            let userNotLoggedIn = false;
            
            if (token != null) {
                axios.delete(config.getBackendApiUrl(`/delete-contact/${_id}`), {
                    headers: {Authorization: `${token}`}
                })
                .then((res) => {
                    if (res.data.valid) {
                        showPopup("Contact deleted");
                        syncContacts();
                        changeViewFunction({});
                    }
                    else {
                        showFormError("Contact could not be deleted");
                    }
                })
                .catch((err) => {
                    showFormError("Contact could not be deleted")
                })
            }
            else {
                showPopup("Please login")
                userNotLoggedIn = true;
            }
            if(userNotLoggedIn) {
                setTimeout(() => {
                    document.location.href = config.loginPage
                }, 1200);
            }
        }

        return <>
            <h3 className="contact-card-title">Contact Preview</h3>
            <span className="contact-preview-details">
                <p className="contact-preview-name">
                    Name: <span id="name-value">{contactDetails.name}</span>
                </p>
                <p className="contact-preview-number">
                    Number: <span id="number-value">{contactDetails.ph_num}
                        <span id="copy-number-button" className="secondary-button" onClick={() => {
                            if(contactDetails.ph_num.trim() == "") {
                                showPopup("No Number to Copy");
                                return;
                            }
                            navigator.clipboard.writeText(`${contactDetails.ph_num}`)
                            showPopup("Number Copied")
                        }}><img src="./64_copy.png" alt="(COPY)" height={16} /></span>
                    </span>
                </p>
            </span>
            <div className="contact-related-buttons">
                <button className="edit-contact-button" onClick={() => {
                    changeViewFunction(contactDetails, true);
                }}>Edit</button>
                <button className="delete-contact-button critical-button" onClick={() => {
                    let a = confirm(`Are you sure you want to delete this contact? (Permanently)`)
                    if(a) deleteContactRequest();
                }}>Delete</button>
                <button className="copy-contact-details-button secondary-button" onClick={() => {
                    let str = `\nName: ${contactDetails.name}\nNumber: ${contactDetails.ph_num}`
                    navigator.clipboard.writeText(str);
                    showPopup("Copied Contact Details");
                }}>Copy Details</button>
            </div>
        </>
    }
    else {
        return <h3 className="contact-card-title">Nothing to Preview</h3>
    }
}

export function Home({ userDetails }) {
    let [currentContactView, setCurrentContactView] = useState({})
    let [currentContactsList, setCurrentContactsList] = useState(["loading"])

    function syncContacts() {
        let newList = [];

        if (userDetails._id == null) {
            newList = ["loggedOut"];
            setCurrentContactsList(newList)
        }
        else {
            const _id = userDetails._id;
            const token = localStorage.getItem(config.tokenLocalKey);
            let userNotLoggedIn = false;

            if(token != null) {
                axios.get(config.getBackendApiUrl(`/get-contacts/${_id}`), {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                .then((res) => {
                    if(res.data.valid) {
                        newList = res.data.list;
                        setCurrentContactsList(newList)
                        return;
                    }
                    else {
                        newList = null
                    }
                })
                .catch((err) => {
                    showPopup(err.response ? err.response.data.message : ("unknown error: " + err.message));
                    newList = null
                    if(err.response){
                        if (err.response.data.relogin) {
                            showPopup("Please login");
                            newList = ["loggedOut"]
                            userNotLoggedIn = true;
                        }
                        else {
                            showPopup(err.response.data.message);
                            newList = null;
                        }
                    }
                })
                .finally(() => {
                    setCurrentContactsList(newList)
                })
            }
            else {
                showPopup("Please login");
                setCurrentContactsList(["loggedOut"])
                userNotLoggedIn = true;
            }
            if(userNotLoggedIn) {
                setTimeout(() => {
                    document.location.href = config.loginPage
                }, 1200);
            }
        }
    }

    function changeCurrentContactView(contactObj, editMode) {
        contactObj.editMode = editMode;
        setCurrentContactView({...contactObj});
    }

    useEffect(() => {
        // get contacts for the user
        syncContacts();
    }, [])

    return <div className="home-content">
        <div className="contacts-div">
            <h2 className="contacts-div-title">Your Contacts</h2>
            <div className="contacts-list">
                <div id="contacts-list-wrapper">
                    {
                        mapContactListToDisplay(currentContactsList, changeCurrentContactView)
                    }
                </div>
            </div>
            <button className="add-contact-button" onClick={() => {
                changeCurrentContactView({_id: "new"}, true)
            }}>Add Contact</button>
        </div>
        <div className={`contact-preview-div-container ${currentContactView.editMode == null ? "card-hidden" : ""}`} onClick={(e) => {
            if(!e.target.classList.contains("contact-preview-div-container")) return;
            changeCurrentContactView(currentContactView, null)
            }}>
            <div className={`contact-preview-div ${currentContactView.editMode == null ? "card-hidden" : ""}`}>
                <button className="close-preview-button critical-button" onClick={() => {changeCurrentContactView(currentContactView, null)}}>X</button>
                <PreviewPaneDiv 
                    contactDetails={currentContactView} 
                    userDetails={userDetails} 
                    changeViewFunction={changeCurrentContactView} 
                    syncContacts={syncContacts}
                />
            </div>
        </div>
    </div>
}