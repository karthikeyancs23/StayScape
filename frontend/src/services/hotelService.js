
import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

// Get all hotels
export const getHotels = async (params = {}) => {
    const response = await API.get("/hotels", { params });
    return response.data;
};

// Get hotel by ID
export const getHotelById = async (id) => {
    const response = await API.get(`/hotels/${id}`);
    return response.data;
};

// Create hotel with image
export const createHotel = async (hotelData) => {
    const response = await API.post("/hotels", hotelData);
    return response.data;
};

// Update hotel with image
export const updateHotel = async (id, hotelData) => {
    const response = await API.put(`/hotels/${id}`, hotelData);
    return response.data;
};

// Delete hotel
export const deleteHotel = async (id) => {
    const response = await API.delete(`/hotels/${id}`);
    return response.data;
};

export default API;
