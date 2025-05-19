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
import AdministrationHotelTypeList from "./components/admin/HotelType/AdministrationHotelTypeList.jsx";
import AddHotelType from "./components/admin/HotelType/AddHotelType.jsx";
import EditHotelType from "./components/admin/HotelType/EditHotelType.jsx";
import PaymentRoomAdministration from "./components/admin/RoomPayment/PaymentRoomAdministration.jsx";
import PaymentAmenityAdministration from "./components/admin/AmenityPayment/PaymentAmenityAdministration.jsx";
import BankAdministration from "./components/admin/Bank/BankAdministration.jsx";
import AddBank from "./components/admin/Bank/AddBank.jsx";
import EditBank from "./components/admin/Bank/EditBank.jsx";
import PaymentTypeAdministration from "./components/admin/PaymentType/PaymentTypeAdministration.jsx";
import AddPaymentType from "./components/admin/PaymentType/AddPaymentType.jsx";
import EditPaymentType from "./components/admin/PaymentType/EditPaymentType.jsx";
import HotelReviewAdministration from "./components/admin/HotelReview/HotelReviewAdministration.jsx";
import AmenityReviewAdministration from "./components/admin/AmenityReview/AmenityReviewAdministration.jsx";
import EmployeeTypeAdministration from "./components/admin/EmployeeType/EmployeeTypeAdministration.jsx";
import AddEmployeeType from "./components/admin/EmployeeType/AddEmployeeType.jsx";
import EditEmployeeType from "./components/admin/EmployeeType/EditEmployeeType.jsx";
import RoomAdministration from "./components/admin/Room/RoomAdministration.jsx";
import AddRoom from "./components/admin/Room/AddRoom.jsx";
import EditRoom from "./components/admin/Room/EditRoom.jsx";
import CardAdministration from "./components/admin/Card/CardAdministration.jsx";
import ComfortAdministration from "./components/admin/Comfort/ComfortAdministration.jsx";
import AddComfort from "./components/admin/Comfort/AddComfort.jsx";
import EditComfort from "./components/admin/Comfort/EditComfort.jsx";
import RoomComfortAdministration from "./components/admin/RoomComfort/RoomComfortAdministration.jsx";
import AddRoomComfort from "./components/admin/RoomComfort/AddRoomComfort.jsx";
import GuestAdministration from "./components/admin/Guest/GuestAdministration.jsx";

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/task-in-progress/:employeeId" element={<InProgressTask />} />
                    <Route path="/task-tracker/:employeeId" element={<TaskTracker />} />
                    <Route path="/done-tasks/:employeeId" element={<DoneTaskList />} />
                    <Route path="/employee-panel" elementя={<EmployeeProfile />} />

                    <Route path="/guest-administration" element={<GuestAdministration />} />
                    <Route path="/add-room-comfort" element={<AddRoomComfort />} />
                    <Route path="/room-comfort-administration" element={<RoomComfortAdministration />} />
                    <Route path="/edit-comfort/:comfortId" element={<EditComfort />} />
                    <Route path="/add-comfort" element={<AddComfort />} />
                    <Route path="/comfort-administration" element={<ComfortAdministration />} />
                    <Route path="/card-administration" element={<CardAdministration />} />
                    <Route path="/edit-room/:roomId" element={<EditRoom />} />
                    <Route path="/add-room" element={<AddRoom />} />
                    <Route path="/room-administration" element={<RoomAdministration />} />
                    <Route path="/edit-employee-type/:employeeTypeId" element={<EditEmployeeType />} />
                    <Route path="/add-employee-type" element={<AddEmployeeType />} />
                    <Route path="/employee-type-administration" element={<EmployeeTypeAdministration />} />
                    <Route path="/amenity-review-administration" element={<AmenityReviewAdministration />} />
                    <Route path="/hotel-review-administration" element={<HotelReviewAdministration />} />
                    <Route path="/edit-payment-type/:paymentTypeId" element={<EditPaymentType />} />
                    <Route path="/add-payment-type" element={<AddPaymentType />} />
                    <Route path="/payment-type-administration/" element={<PaymentTypeAdministration />} />
                    <Route path="/edit-bank/:bankId" element={<EditBank />} />
                    <Route path="/add-bank" element={<AddBank />} />
                    <Route path="/bank-administration" element={<BankAdministration />} />
                    <Route path="/payment-amenity-administration" element={<PaymentAmenityAdministration />} />
                    <Route path="/payment-room-administration" element={<PaymentRoomAdministration />} />
                    <Route path="/edit-hotel-type/:hotelTypeId" element={<EditHotelType />} />
                    <Route path="/add-hotel-type" element={<AddHotelType />} />
                    <Route path="/hotel-types-administration" element={<AdministrationHotelTypeList />} />
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