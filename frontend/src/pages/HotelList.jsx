
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
    Search,
    MapPin,
    Pencil,
    Trash2,
    Hotel,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    X,
    Plus,
    ArrowRight,
    LoaderCircle,
} from "lucide-react";

import { fetchHotels } from "../redux/hotelSlice";
import { deleteHotel } from "../services/hotelService";

function HotelList() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { hotels, loading, error, pagination } = useSelector(
        (state) => state.hotels
    );

    const [search, setSearch] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [page, setPage] = useState(1);

    const [selectedHotel, setSelectedHotel] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [notification, setNotification] = useState("");

    const limit = 6;

    // Backend image URL helper
    const getImageUrl = (image) => {
        if (!image) {
            return "https://placehold.co/600x400?text=Hotel+Image";
        }

        if (image.startsWith("http")) {
            return image;
        }

        const serverUrl = (
            import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        ).replace(/\/api\/?$/, "");

        return `${serverUrl}/${image.replace(/^\/+/, "")}`;
    };

    // Fetch hotels from backend
    useEffect(() => {
        const params = {
            search,
            page,
            limit,
        };

        if (minPrice !== "") {
            params.minPrice = minPrice;
        }

        if (maxPrice !== "") {
            params.maxPrice = maxPrice;
        }

        dispatch(fetchHotels(params));
    }, [dispatch, search, minPrice, maxPrice, page]);

    // Search handler
    const handleSearch = (event) => {
        setSearch(event.target.value);
        setPage(1);
    };

    // Price filter handlers
    const handleMinPrice = (event) => {
        setMinPrice(event.target.value);
        setPage(1);
    };

    const handleMaxPrice = (event) => {
        setMaxPrice(event.target.value);
        setPage(1);
    };

    // Clear filters
    const clearFilters = () => {
        setSearch("");
        setMinPrice("");
        setMaxPrice("");
        setPage(1);
    };

    // Open delete confirmation
    const confirmDelete = (hotel) => {
        setSelectedHotel(hotel);
        setShowDeleteModal(true);
    };

    // Delete hotel
    const handleDelete = async () => {
        if (!selectedHotel) return;

        try {
            setDeleting(true);

            await deleteHotel(selectedHotel.id);

            setShowDeleteModal(false);
            setSelectedHotel(null);

            setNotification("Hotel deleted successfully!");

            // If the deleted hotel was the only item on this page,
            // move to the previous page.
            const nextPage =
                hotels.length === 1 && page > 1 ? page - 1 : page;

            setPage(nextPage);

            const params = {
                search,
                page: nextPage,
                limit,
            };

            if (minPrice !== "") params.minPrice = minPrice;
            if (maxPrice !== "") params.maxPrice = maxPrice;

            await dispatch(fetchHotels(params));

            setTimeout(() => {
                setNotification("");
            }, 3000);
        } catch (err) {
            setNotification(
                err.response?.data?.message || "Unable to delete hotel."
            );

            setTimeout(() => {
                setNotification("");
            }, 3000);
        } finally {
            setDeleting(false);
        }
    };

    const totalPages = pagination?.totalPages || 1;
    const totalHotels = pagination?.total || 0;

    return (
        <div className="hotel-list-page">

            {/* HERO SECTION */}
            <section className="stayscape-hero">
                <div className="hero-content">
                    <span className="hero-tag">
                        WELCOME TO STAYSCAPE
                    </span>

                    <h1>
                        Discover Places.
                        <br />
                        Create Memories.
                    </h1>

                    <p>
                        StayScape is a hotel discovery and management
                        platform that helps you explore, search, and
                        compare hotels with ease. Find the perfect stay
                        based on your budget, explore hotel locations
                        on an interactive map, and discover destinations
                        for your next journey.
                    </p>

                    <div className="hero-actions">
                        <Link to="/add-hotel" className="hero-button">
                            <Plus size={19} />
                            Add New Hotel
                        </Link>

                        <a href="#hotel-list" className="hero-secondary">
                            Explore Hotels
                            <ArrowRight size={18} />
                        </a>
                    </div>

                    <div className="hero-features">
                        <span>✓ Smart Hotel Search</span>
                        <span>✓ Price Filtering</span>
                        <span>✓ Interactive Maps</span>
                        <span>✓ Easy Management</span>
                    </div>
                </div>
            </section>

            {/* HOTEL LIST SECTION */}
            <section className="hotel-section" id="hotel-list">

                <div className="hotel-section-heading">
                    <div>
                        <span className="section-label">
                            EXPLORE OUR COLLECTION
                        </span>

                        <h2>Find Your Perfect Stay</h2>

                        <p>
                            Browse our handpicked hotels and discover
                            your next favourite destination.
                        </p>
                    </div>

                    
                </div>

                {/* SEARCH AND FILTERS */}
                <div className="hotel-filter-container">

                    <div className="hotel-search-box">
                        <Search size={20} />

                        <input
                            type="text"
                            placeholder="Search hotels by name..."
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>

                    <div className="price-filter">
                        <SlidersHorizontal size={19} />

                        <input
                            type="number"
                            placeholder="Min price"
                            min="0"
                            value={minPrice}
                            onChange={handleMinPrice}
                        />

                        <span>to</span>

                        <input
                            type="number"
                            placeholder="Max price"
                            min="0"
                            value={maxPrice}
                            onChange={handleMaxPrice}
                        />
                    </div>

                    <button
                        type="button"
                        className="clear-filter-button"
                        onClick={clearFilters}
                    >
                        <X size={16} />
                        Clear
                    </button>
                </div>

                {/* HOTEL COUNT */}
                <div className="hotel-results-info">
                    <div>
                        <Hotel size={19} />
                        <span>
                            Showing <strong>{hotels.length}</strong> of{" "}
                            <strong>{totalHotels}</strong> hotels
                        </span>
                    </div>
                </div>

                {/* LOADING */}
                {loading && (
                    <div className="hotel-loading">
                        <LoaderCircle size={35} className="loading-icon" />
                        <p>Finding your perfect stay...</p>
                    </div>
                )}

                {/* ERROR */}
                {!loading && error && (
                    <div className="hotel-error">
                        <h3>Something went wrong</h3>
                        <p>{error}</p>

                        <button
                            onClick={() => dispatch(fetchHotels({ page, limit }))}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && !error && hotels.length === 0 && (
                    <div className="hotel-empty">
                        <Hotel size={55} />

                        <h3>No Hotels Found</h3>

                        <p>
                            We couldn't find any hotels matching your
                            search. Try changing your filters.
                        </p>

                        <button
                            onClick={clearFilters}
                            className="clear-filter-button"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* HOTEL CARDS */}
                {!loading && !error && hotels.length > 0 && (
                    <div className="hotel-grid">

                        {hotels.map((hotel) => (
                            <article
                                className="hotel-card"
                                key={hotel.id}
                            >
                                <div className="hotel-card-image">
                                    <Link to={`/hotels/${hotel.id}`}>
                                        <img
                                            src={getImageUrl(hotel.image)}
                                            alt={hotel.title}
                                            onError={(event) => {
                                                event.currentTarget.src =
                                                    "https://placehold.co/600x400?text=Image+Unavailable";
                                            }}
                                        />
                                    </Link>

                                    <div className="hotel-price-badge">
                                        ₹{Number(hotel.price).toLocaleString("en-IN")}
                                        <span> / night</span>
                                    </div>
                                </div>

                                <div className="hotel-card-content">

                                    <Link
                                        to={`/hotels/${hotel.id}`}
                                        className="hotel-card-title"
                                    >
                                        {hotel.title}
                                    </Link>

                                    <p className="hotel-description">
                                        {hotel.description?.length > 115
                                            ? `${hotel.description.substring(0, 115)}...`
                                            : hotel.description}
                                    </p>

                                    <div className="hotel-location">
                                        <MapPin size={16} />

                                        <span>
                                            {Number(hotel.latitude).toFixed(4)},
                                            {" "}
                                            {Number(hotel.longitude).toFixed(4)}
                                        </span>
                                    </div>

                                    <div className="hotel-card-footer">

                                        <Link
                                            to={`/hotels/${hotel.id}`}
                                            className="view-details-button"
                                        >
                                            View Details
                                            <ArrowRight size={16} />
                                        </Link>

                                        <div className="hotel-actions">

                                            <button
                                                type="button"
                                                className="edit-hotel-button"
                                                title="Edit hotel"
                                                onClick={() =>
                                                    navigate(
                                                        `/edit-hotel/${hotel.id}`
                                                    )
                                                }
                                            >
                                                <Pencil size={17} />
                                            </button>

                                            <button
                                                type="button"
                                                className="delete-hotel-button"
                                                title="Delete hotel"
                                                onClick={() =>
                                                    confirmDelete(hotel)
                                                }
                                            >
                                                <Trash2 size={17} />
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}

                    </div>
                )}

                {/* PAGINATION */}
                {!loading && !error && totalPages > 1 && (
                    <div className="hotel-pagination">

                        <button
                            type="button"
                            disabled={page === 1}
                            onClick={() => setPage((prev) => prev - 1)}
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>

                        <div className="pagination-pages">
                            {Array.from(
                                { length: totalPages },
                                (_, index) => index + 1
                            ).map((pageNumber) => (
                                <button
                                    type="button"
                                    key={pageNumber}
                                    className={
                                        page === pageNumber
                                            ? "active-page"
                                            : ""
                                    }
                                    onClick={() => setPage(pageNumber)}
                                >
                                    {pageNumber}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            disabled={page === totalPages}
                            onClick={() => setPage((prev) => prev + 1)}
                        >
                            Next
                            <ChevronRight size={18} />
                        </button>

                    </div>
                )}

            </section>

            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteModal && (
                <div className="delete-modal-overlay">

                    <div className="delete-modal">

                        <div className="delete-modal-icon">
                            <Trash2 size={28} />
                        </div>

                        <h3>Delete Hotel?</h3>

                        <p>
                            Are you sure you want to delete{" "}
                            <strong>{selectedHotel?.title}</strong>?
                            This action cannot be undone.
                        </p>

                        <div className="delete-modal-actions">

                            <button
                                type="button"
                                className="cancel-delete-button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedHotel(null);
                                }}
                                disabled={deleting}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="confirm-delete-button"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Yes, Delete"}
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* SUCCESS / ERROR NOTIFICATION */}
            {notification && (
                <div className="hotel-notification">
                    {notification}
                </div>
            )}

        </div>
    );
}

export default HotelList;
