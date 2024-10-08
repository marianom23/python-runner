import React from 'react';
import './GraphOutput.css';

const GraphOutput = ({ graphBase64, mode }) => {
    const imageSrc = `data:image/png;base64,${graphBase64}`;
    const isDarkMode = mode === 'dark'; // Determina si el modo es oscuro

    return (
        <div className={`chart-container ${isDarkMode ? 'dark' : 'light'}`}>
            {graphBase64 ? (
                <img 
                    src={imageSrc} 
                    alt="Generated Graph" 
                    className="graph-image"
                />
            ) : (
                <p>No hay gráfico para mostrar</p> // Mensaje cuando no hay gráfico
            )}
        </div>
    );
};

export default GraphOutput;
