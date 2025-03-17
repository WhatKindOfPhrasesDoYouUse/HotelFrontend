import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HotelList from "./components/HotelList.jsx";
import RoomList from "./components/RoomList.jsx";

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/hotels" element={<HotelList />} />
                    <Route path="/hotels/:hotelId/rooms" element={<RoomList />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;