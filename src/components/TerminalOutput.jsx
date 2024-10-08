import React, { useEffect, useRef } from 'react';
import './Output.css';

const TerminalOutput = ({ history, mode, onInputSubmit, waitingForInput }) => {
  const [currentInput, setCurrentInput] = React.useState('');
  const outputRef = useRef(null);
  const inputRef = useRef(null); // Crear una referencia para el textarea

  // Efecto para desplazar al fondo cuando el historial cambia
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight; // Desplazar al fondo
    }
  }, [history]);

  // Efecto para establecer el foco en el textarea cuando se espera entrada
  useEffect(() => {
    if (waitingForInput && inputRef.current) {
      inputRef.current.focus(); // Establecer el foco
    }
  }, [waitingForInput]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentInput.trim()) {
        // Añadir la entrada del usuario al historial antes de limpiar
        onInputSubmit(currentInput); // Llama a la función para manejar el input
        // Agregar la entrada al historial
        history.push(`> ${currentInput}`); // Prefijo como en la terminal
        setCurrentInput(''); // Limpiar el input
      }
    }
  };

  return (
    <div className={`output-container ${mode}`}>
      <pre className={`output ${mode}`} ref={outputRef}>
        {history.map((entry, index) => (
          <div key={index}>{entry}</div>
        ))}
      </pre>
      {waitingForInput && (
        <textarea
          ref={inputRef} // Asignar la referencia al textarea
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input-box"
          placeholder="Type your input here..."
        />
      )}
    </div>
  );
};

export default TerminalOutput;
