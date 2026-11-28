
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    CircleMarker,
    useMap
} from "react-leaflet";

import L from "leaflet";

import { getHotelById } from "../services/hotelService";

import {
    ArrowLeft,
    MapPin,
    LocateFixed,
    Navigation,
    IndianRupee,
    AlertCircle
} from "lucide-react";

import "leaflet/dist/leaflet.css";
import "./HotelDetails.css";

// Fix the default Leaflet marker icons when using Vite
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const hotelMarkerIcon = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Backend base URL
const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

// Handle Cloudinary URLs and older local image paths
const getHotelImageUrl = (image) => {
    if (!image) {
        return "/placeholder-hotel.jpg";
    }

    // Cloudinary image URL: use it directly
    if (/^https?:\/\//i.test(image)) {
        return image;
    }

    // Older local uploads: use the backend URL
    return `${API_BASE_URL}${image.startsWith("/") ? image : `/${image}`}`;
};

// Automatically move the map when its center changes
function MapController({ center }) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.flyTo(center, 14, { duration: 1.2 });
        }
    }, [center, map]);

    return null;
}

function HotelDetails() {
    const { id } = useParams();

    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [userLocation, setUserLocation] = useState(null);
    const [locationMessage, setLocationMessage] = useState("");
    const [locating, setLocating] = useState(false);

    // Fetch hotel details using its ID
    useEffect(() => {
        let active = true;

        const loadHotel = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getHotelById(id);

                if (active) {
                    setHotel(response.data);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load hotel details."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadHotel();

        return () => {
            active = false;
        };
    }, [id]);

    // Get the visitor's current location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationMessage(
                "Geolocation is not supported by this browser."
            );
            return;
        }

        setLocating(true);
        setLocationMessage("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation([
                    position.coords.latitude,
                    position.coords.longitude
                ]);

                setLocationMessage("Your current location was found.");
                setLocating(false);
            },
            (locationError) => {
                let message = "Unable to get your current location.";

                if (locationError.code === 1) {
                    message =
                        "Location permission was denied. Please allow location access in your browser.";
                } else if (locationError.code === 2) {
                    message = "Your current location is unavailable.";
                } else if (locationError.code === 3) {
                    message =
                        "Location request timed out. Please try again.";
                }

                setLocationMessage(message);
                setLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    if (loading) {
        return (
            <div className="details-status">
                Loading hotel details...
            </div>
        );
    }

    if (error || !hotel) {
        return (
            <div className="details-status error-status">
                <AlertCircle size={25} />
                <p>{error || "Hotel not found."}</p>
                <Link to="/">Back to hotels</Link>
            </div>
        );
    }

    const latitude = Number(hotel.latitude);
    const longitude = Number(hotel.longitude);

    const validCoordinates =
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180;

    const hotelPosition = validCoordinates
        ? [latitude, longitude]
        : null;

    return (
        <main className="hotel-details-page">

            <Link to="/" className="details-back-link">
                <ArrowLeft size={18} />
                Back to hotels
            </Link>

            {/* Hotel image */}
            <div className="details-hero">
                <img
                    src={getHotelImageUrl(hotel.image)}
                    alt={hotel.title}
                    className="details-hero-image"
                    onError={(e) => {
                        console.error(
                            "Hotel image failed to load:",
                            e.currentTarget.src
                        );

                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/placeholder-hotel.jpg";
                    }}
                />

                <div className="details-image-overlay">
                    <span>STAYSCAPE PROPERTY</span>
                    <h1>{hotel.title}</h1>
                </div>
            </div>

            {/* Hotel information */}
            <section className="details-information">

                <div className="details-main-content">
                    <div className="details-section-heading">
                        <span className="details-eyebrow">
                            ABOUT THIS PROPERTY
                        </span>

                        <h2>{hotel.title}</h2>

                        <p>{hotel.description}</p>
                    </div>

                    <div className="coordinates-card">
                        <div className="coordinates-icon">
                            <MapPin size={23} />
                        </div>

                        <div>
                            <h3>Hotel Coordinates</h3>
                            <p>Latitude: {hotel.latitude}</p>
                            <p>Longitude: {hotel.longitude}</p>
                        </div>
                    </div>
                </div>

                <aside className="details-price-card">
                    <span>PRICE PER NIGHT</span>

                    <h2>
                        <IndianRupee size={25} />
                        {Number(hotel.price).toLocaleString("en-IN")}
                    </h2>

                    <p>Per night / Per room</p>
                </aside>

            </section>

            {/* Map */}
            <section className="hotel-map-section">

                <div className="map-heading">
                    <div>
                        <span className="details-eyebrow">
                            FIND YOUR WAY
                        </span>

                        <h2>Hotel Location</h2>

                        <p>
                            Explore the hotel's location on the interactive map.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="locate-button"
                        onClick={getCurrentLocation}
                        disabled={locating}
                    >
                        <LocateFixed size={18} />
                        {locating ? "Finding you..." : "My Location"}
                    </button>
                </div>

                {locationMessage && (
                    <div className="location-message">
                        {locationMessage}
                    </div>
                )}

                {validCoordinates ? (
                    <div className="hotel-map">

                        <MapContainer
                            center={hotelPosition}
                            zoom={14}
                            scrollWheelZoom={true}
                            className="leaflet-map"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <MapController
                                center={userLocation || hotelPosition}
                            />

                            {/* Hotel marker */}
                            <Marker
                                position={hotelPosition}
                                icon={hotelMarkerIcon}
                            >
                                <Popup>
                                    <strong>{hotel.title}</strong>
                                    <br />
                                    Hotel location
                                </Popup>
                            </Marker>

                            {/* Visitor's current location */}
                            {userLocation && (
                                <CircleMarker
                                    center={userLocation}
                                    radius={9}
                                    pathOptions={{
                                        color: "#ffffff",
                                        fillColor: "#2563eb",
                                        fillOpacity: 1,
                                        weight: 3
                                    }}
                                >
                                    <Popup>
                                        Your current location
                                    </Popup>
                                </CircleMarker>
                            )}

                        </MapContainer>

                    </div>
                ) : (
                    <div className="invalid-coordinates">
                        Hotel coordinates are invalid. Please update the latitude and longitude.
                    </div>
                )}

                <div className="map-legend">
                    <span>
                        <i className="hotel-legend-dot"></i>
                        Hotel location
                    </span>

                    <span>
                        <i className="user-legend-dot"></i>
                        Your current location
                    </span>
                </div>

                {validCoordinates && (
                    <a
                        className="directions-link"
                        href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Navigation size={17} />
                        Get Directions
                    </a>
                )}

            </section>

        </main>
    );
}

export default HotelDetails;
