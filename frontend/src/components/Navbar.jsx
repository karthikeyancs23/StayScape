
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Hotel, Menu, X, Plus } from "lucide-react";
import "./Navbar.css";

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    return (
        <header className="site-header">
            <nav className="navbar">

                {/* Brand logo */}
                <Link to="/" className="brand" onClick={closeMenu}>
                    <span className="brand-icon">
                        <Hotel size={25} strokeWidth={2} />
                    </span>

                    <span className="brand-name">
                        Stay<span>Scape</span>
                    </span>
                </Link>

                {/* Mobile menu toggle */}
                <button
                    className="menu-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation"
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? <X size={23} /> : <Menu size={23} />}
                </button>

                {/* Navigation */}
                <div className={`nav-menu ${menuOpen ? "show-menu" : ""}`}>

                    <div className="nav-links">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                isActive ? "nav-item selected" : "nav-item"
                            }
                            onClick={closeMenu}
                        >
                            Home
                        </NavLink>

                        <a
                            href="/#hotels"
                            className="nav-item"
                            onClick={closeMenu}
                        >
                            Explore Hotels
                        </a>
                    </div>

                    <Link
                        to="/add-hotel"
                        className="nav-add-button"
                        onClick={closeMenu}
                    >
                        <Plus size={18} />
                        <span>Add Hotel</span>
                    </Link>

                </div>
            </nav>
        </header>
    );
}

export default Navbar;