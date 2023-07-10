import config, {showPopup} from "../../config.js"
import './profile.css'

export function Profile({ userDetails }) {
    return userDetails
    ? <div className="profile-content">
        <button className="go-home-button third-type-button" onClick={() => {
            location.href = "/"
        }}><div className="left-arrow"></div>Go to Homepage</button>
        <div className="profile-card">
            <h2 id="profile-card-title">Your Profile</h2>
            <p className="profile-detail">Name: <span className="detail-value">{userDetails.name}</span></p>
            <p className="profile-detail">Username: <span className="detail-value">{userDetails.username}</span></p>
            <button className="logout-button critical-button" type="button" onClick={() => {
                sessionStorage.clear();
                localStorage.removeItem(config.tokenLocalKey);
                showPopup("Logged out successfully")
                setTimeout(() => {
                    location.href = "/";
                }, 1400);
            }}>Logout</button>
        </div>
    </div> 
    : <div className="profile-content">
        <span>Nothing to see here, go to the <a href="/">Homepage</a></span>
    </div>
}