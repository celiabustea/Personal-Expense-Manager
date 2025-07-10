import React from 'react';

interface NavbarProps {
  username?: string;
}

const Navbar: React.FC<NavbarProps> = ({ username = 'User' }) => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* Search bar removed */}
      </div>

      <div className="navbar-right">
        {/* Removed Welcome, User text */}
      </div>
    </nav>
  );
};

export default Navbar;
