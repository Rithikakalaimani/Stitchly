import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HiOutlineMenu } from 'react-icons/hi';
import { IoClose } from 'react-icons/io5';
import './Layout.css';

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="layout">
      <header className="header">
        <NavLink to="/" className="logo">
          <span className="logo-icon">✂</span>
          <span className="logo-text">Stitchly</span>
        </NavLink>
        <button
          type="button"
          className="nav-menu-button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <IoClose className="nav-menu-icon" aria-hidden /> : <HiOutlineMenu className="nav-menu-icon" aria-hidden />}
        </button>
        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Dashboard
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Customers
          </NavLink>
          <NavLink to="/designs" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Designs
          </NavLink>
        </nav>
      </header>
      {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <main className="main">
        {children}
      </main>
    </div>
  );
}
