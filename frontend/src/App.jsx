
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import HotelList from "./pages/HotelList";
import AddHotel from "./pages/AddHotel";
import EditHotel from "./pages/EditHotel";
import HotelDetails from "./pages/HotelDetails";
function App() {
    return (
        <>
            <Navbar />

            <Routes>
                <Route path="/" element={<HotelList />} />

                <Route path="/add-hotel" element={<AddHotel />} />

                <Route path="/edit-hotel/:id" element={<EditHotel />} />

                <Route path="*" element={<Navigate to="/" replace />} />

                
                <Route path="/hotels/:id" element={<HotelDetails />} />
                
            </Routes>
        </>
    );
}

export default App;