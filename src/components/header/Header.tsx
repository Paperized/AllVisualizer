import React from "react";

function Header() {
  return (
    <header className="d-flex list-links">
      <a className='me-auto align-self-center nav-link' href='#'>ALL VISUALIZER</a>
      <a className='item-link selected' href='#'>HOME</a>
      <a className='item-link' href='#'>VISUALIZE</a>
      <a className='item-link' href='#'>TEST</a>
      <a className='item-link' href='#'>GO</a>
    </header>
  );
}
  
export default Header;
  