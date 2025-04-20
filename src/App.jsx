import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HotelDetail from "./components/HotelDetail.jsx";
import RoomList from "./components/RoomList.jsx";
import Login from "./components/Login.jsx";
import GuestRegistration from "./components/GuestRegistration.jsx";
import GuestProfile from "./components/GuestProfile.jsx";
import EditGuestProfile from "./components/EditGuestProfile.jsx";
import AddCard from "./components/AddCard.jsx";
import EditCard from "./components/EditCard.jsx";
import SingleRoomBooking from "./components/SingleRoomBooking.jsx";
import DeleteClient from "./components/DeleteClient.jsx";
import RoomBookingsList from "./components/RoomBookingsList.jsx";
import GroupRoomBooking from "./components/GroupRoomBooking.jsx";

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/mybookings" element={<RoomBookingsList />} />
                    <Route path="/delete-client/:guestId/:clientId" element={<DeleteClient />} />
                    <Route path="/group-room-booking/:roomId" element={<GroupRoomBooking />} />
                    <Route path="/single-room-booking/:roomId" element={<SingleRoomBooking />} />
                    <Route path="/edit-card/:cardId" element={<EditCard />} />
                    <Route path="/add-card" element={<AddCard />} />
                    <Route path="/bind-card-to-guest" element={<EditGuestProfile />} />
                    <Route path="/edit-guest-profile" element={<EditGuestProfile />} />
                    <Route path="/guest-profile" element={<GuestProfile />} />
                    <Route path="/guest-registration" element={<GuestRegistration />} />
                    <Route path="/hotels" element={<HotelDetail />} />
                    <Route path="/hotels/:hotelId/rooms" element={<RoomList />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;