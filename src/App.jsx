import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HotelList from "./components/HotelList.jsx";
import RoomList from "./components/RoomList.jsx";
import Login from "./components/Login.jsx";
import GuestRegistration from "./components/GuestRegistration.jsx";
import GuestProfile from "./components/GuestProfile.jsx";
import EditGuestProfile from "./components/EditGuestProfile.jsx";

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/edit-guest-profile" element={<EditGuestProfile />} />
                    <Route path="/guest-profile" element={<GuestProfile />} />
                    <Route path="/guest-registration" element={<GuestRegistration />} />
                    <Route path="/hotels" element={<HotelList />} />
                    <Route path="/hotels/:hotelId/rooms" element={<RoomList />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;