// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchData } from '../thunks/fetchData'; // Asegúrate de que la ruta sea correcta
import { setLanguage } from '../slices/languageSlice';

const Home = () => {

  const dispatch = useDispatch();
  const currentLanguage = useSelector((state) => state.language.currentLanguage);

  const handleChangeLanguage = (event) => {
    dispatch(setLanguage(event.target.value));
  };

  return (
    <div>
      <h1>Bienvenido a la plataforma de ejercicios y sandbox</h1>
      <ul>
        <li>
          <Link to="/sandbox">Ir al Sandbox</Link>
        </li>
        <li>
          <Link to="/exercise/1">Ejercicio 1</Link>
        </li>
        <li>
          <Link to="/exercise/2">Ejercicio 2</Link>
        </li>
        {/* Agrega más enlaces según los ejercicios que tengas */}
      </ul>

      <p>Current Language: {currentLanguage}</p>
      <label htmlFor="language">Select Language:</label>
      <select id="language" value={currentLanguage} onChange={handleChangeLanguage}>
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
  
    </div>
    
  );
};

export default Home;
