import React from 'react';
import './NavigationComponent.css'; // Archivo CSS para los estilos

const NavigationComponent = ({ closedFiles, restoreFile, deleteFile, mode }) => {
  const handleContextMenu = (event, file) => {
    event.preventDefault(); // Prevenir el menú contextual predeterminado
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar "${file.id}"?`);
    if (confirmDelete) {
      deleteFile(file.id); // Llama a la función para eliminar el archivo
    }
  };

  return (
    <div className={`navigation-component ${mode}`}>
      <div className="files-grid">
        {closedFiles.map((file) => (
          <div 
            key={file.id} 
            className="file-item"
            onClick={() => restoreFile(file)}
            onContextMenu={(event) => handleContextMenu(event, file)} // Agregar el evento de clic derecho
          >
            {file.id}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavigationComponent;
