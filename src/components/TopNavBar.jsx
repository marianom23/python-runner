import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../slices/themeSlice';
import './TopNavBar.css';

const TopNavBar = ({ onRunCode, loading, addEditor, objetivoEjercicio, downloadCodes }) => {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // New state for the sidebar
  const [fileName, setFileName] = useState(''); // State to store the file name input

  const toggleDropdown = (index) => {
    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleBackdropClick = (e) => {
    if (e.target.className.includes('popup-backdrop')) {
      setShowPopup(false);
    }
  };

  const handleNewFile = () => {
    setShowSidebar(true); // Show the sidebar when clicking "New File"
  };

  const handleFileCreation = () => {
    if (fileName) {
      addEditor(fileName); // Pass the file name to the addEditor function
      setFileName(''); // Reset the input
      setShowSidebar(false); // Hide the sidebar after creation
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleFileCreation(); // Trigger file creation on Enter key press
    }
  };

  return (
    <>
      <header className={`topNavBar ${mode}`}>
        <div className="logo">MyApp</div>
        <nav className="navLinks">
          <div className="navItem" onClick={() => toggleDropdown(1)}>
            File
            {dropdownOpen === 1 && (
              <div className="dropdown">
                <a onClick={handleNewFile}>New File</a>
                <a href="#open">Open File</a>
                <a href="#save">Save</a>
              </div>
            )}
          </div>
          <div className="navItem" onClick={() => toggleDropdown(2)}>
            Edit
            {dropdownOpen === 2 && (
              <div className="dropdown">
                <a href="#undo">Undo</a>
                <a href="#redo">Redo</a>
                <a href="#cut">Cut</a>
                <a href="#copy">Copy</a>
                <a href="#paste">Paste</a>
              </div>
            )}
          </div>
          <div className="navItem">Selection</div>
          <div className="navItem">View</div>
          <div className="navItem">Go</div>
          <div className="navItem" onClick={onRunCode} disabled={loading}>
            {loading ? 'Loading' : 'Run'}
          </div>
        </nav>
        <div className="actions">
          <button className="actionButton" onClick={downloadCodes}>Descargar codigo</button>
          <button className="actionButton" onClick={togglePopup}>
            Objetivo del ejercicio
          </button>
          <button className="actionButton themeToggleButton" onClick={handleThemeToggle}>
            <span className="themeIcon">&#9733;</span> {/* Moon icon for dark mode */}
          </button>
        </div>
      </header>

      {/* Sidebar for entering the new file name */}
      {showSidebar && (
        <div className={`sidebar ${mode}`}>
          <h3>Create New File</h3>
          <input
            type="text"
            placeholder="Enter file name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onKeyDown={handleKeyDown} // Trigger file creation on Enter key press
          />
          <button onClick={handleFileCreation}>Create</button>
          <button onClick={() => setShowSidebar(false)}>Cancel</button>
        </div>
      )}

      {/* Popup for objetivo del ejercicio */}
      {showPopup && (
        <div className="popup-backdrop" onClick={handleBackdropClick}>
          <div className={`popup-content ${mode}`}>
            <button className="close-btn" onClick={togglePopup}>×</button>
            <h2>Objetivo del ejercicio</h2>
            <p>{objetivoEjercicio ? objetivoEjercicio : "No hay objetivos, diviertete probando codigo!"}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavBar;
