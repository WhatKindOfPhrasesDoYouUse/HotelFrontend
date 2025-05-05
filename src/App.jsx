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
import PayRoomBooking from "./components/PayRoomBooking.jsx";
import HotelReviewList from "./components/HotelReviewList.jsx";
import WriteHotelReview from "./components/WriteHotelReview.jsx";
import AmenityList from "./components/AmenityList.jsx";
import AmenityBooking from "./components/AmenityBooking.jsx";
import AmenityBookingsList from "./components/AmenityBookingsList.jsx";
import AdminProfile from "./components/admin/AdminProfile.jsx";
import RegisterEmployee from "./components/admin/RegisterEmployee.jsx";
import EmployeeProfile from "./components/employee/EmployeeProfile.jsx";
import DoneTaskList from "./components/employee/DoneTaskList.jsx";
import TaskTracker from "./components/employee/TaskTracker.jsx";
import PayAmenityBooking from "./components/PayAmenityBooking.jsx";
import InProgressTask from "./components/employee/InProgressTask.jsx";
import WriteAmenityReview from "./components/WriteAmenityReview.jsx";
import AmenityReviewList from "./components/AmenityReviewList.jsx";
import ChangePassword from "./components/ChangePassword.jsx";

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/task-in-progress/:employeeId" element={<InProgressTask />} />
                    <Route path="/task-tracker/:employeeId" element={<TaskTracker />} />
                    <Route path="/done-tasks/:employeeId" element={<DoneTaskList />} />
                    <Route path="/employee-panel" element={<EmployeeProfile />} />

                    <Route path="/register-employee" element={<RegisterEmployee />} />
                    <Route path="/admin-panel" element={<AdminProfile />} />

                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/amenity-review/:roomId" element={<AmenityReviewList />} />
                    <Route path="/amenity-review/:bookingId/:amenityId" element={<WriteAmenityReview />} />
                    <Route path="/amenity-payment/:amenityBookingId" element={<PayAmenityBooking />} />
                    <Route path="/myamenitys/:bookingId" element={<AmenityBookingsList />} />
                    <Route path="/amenity-booking/:amenityId/:bookingId" element={<AmenityBooking />} />
                    <Route path="/amenity-list/:bookingId" element={<AmenityList />} />
                    <Route path="/hotel-review/:bookingId" element={<WriteHotelReview />} />
                    <Route path="/hotels/:hotelId/reviews" element={<HotelReviewList />} />
                    <Route path="/payment-room-booking/:bookingId" element={<PayRoomBooking />} />
                    <Route path="/payment-room-booking/:bookingId" element={<PayRoomBooking />} />
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