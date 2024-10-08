// src/components/Exercise.js

import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // Importar useParams
import { Layout, Model } from 'flexlayout-react';
import { useSelector } from 'react-redux';
import { layoutModelJson } from '../utils/layoutModelJson';
import useFlexLayoutTheme from '../hooks/useFlexLayoutTheme';
import { exercises } from '../utils/exercises';
import TopNavBar from '../components/TopNavBar';
import Editor from '../components/Editor';
import TerminalOutput from '../components/TerminalOutput';
import usePyodide from '../hooks/usePyodide';
import './Sandbox.css';
import 'flexlayout-react/style/light.css';
import terminalIcon from '../assets/images/terminal.svg';
import folderIcon from '../assets/images/folder.svg';
import GraphOutput from '../components/GraphOutput';

const Exercise = () => {
  const { exerciseId } = useParams(); // Obtener el ID del ejercicio
  const { runPythonCode, loading, outputPyodideHistory, outputPyodideGraph, waitingForInput, provideInput, editors, setEditors } = usePyodide();
  const layoutRef = useRef(null);
  const mode = useSelector((state) => state.theme.mode);
  const modelJson = useMemo(() => layoutModelJson(terminalIcon, folderIcon), []);
  const model = useMemo(() => Model.fromJson(modelJson), [modelJson]);
  const exercise = exercises.find((ex) => ex.id === exerciseId);

  const downloadCodes = () => {
    editors.forEach(editor => {
      // Crear un Blob para cada código del editor
      const blob = new Blob([editor.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      // Asignar el nombre del archivo basado en el ID del editor
      a.href = url;
      a.download = `${editor.id}.py`; // Cambia la extensión según sea necesario

      // Simular un clic para iniciar la descarga
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Limpiar la URL creada
      URL.revokeObjectURL(url);
    });
  };

  // Función para manejar los cambios en el contenido de un editor específico
  const handleCodeChange = (id, newCode) => {
    setEditors((prevEditors) =>
      prevEditors.map((editor) => 
        editor.id === id ? { ...editor, code: newCode } : editor
      )
    );
  };

  // Combinar el código de todos los editores y ejecutarlo
  const handleRunCode = async () => {
    await runPythonCode(editors, "mainPy");
  };

  useFlexLayoutTheme(mode);

  // Crear el primer editor automáticamente al iniciar la app
  useEffect(() => {
    if (layoutRef.current) {
      if (exercise) {
        // Iterar sobre los editores y crear pestañas basadas en sus IDs
        Object.entries(exercise.editors).forEach(([key, editor]) => {
          console.log(editor);
          layoutRef.current.addTabToTabSet("#3a8361ce-881c-44d6-827c-487d1fcdb066", {
            type: "tab",
            component: "EditorComponent",
            name: key, 
            enableClose: false,
          });

          setEditors(prevEditors => [
            ...prevEditors,
            { id: key, code: editor.code, readOnly: editor.isReadOnly }
          ]);
        });
      }
    }
  }, [exercise, layoutRef, setEditors]);

  const factory = useCallback((node) => {
    const component = node.getComponent();
    switch (component) {
      case 'EditorComponent': {
        const editorId = node.getName(); // Obtener el id del editor desde el nombre del tab
        const editorData = editors?.find((editor) => editor.id === editorId);  // Encontrar el editor específico
        return (
          <Editor
            value={editorData ? editorData.code : ''}
            onChange={(newCode) => handleCodeChange(editorId, newCode)} // Manejar cambios en un editor específico
            mode={mode}
            readOnly={editorData.readOnly}
          />
        );
      }
      case 'TerminalOutputComponent':
        return (
          <TerminalOutput
            history={outputPyodideHistory} // Pasar el historial
            onInputSubmit={provideInput}
            waitingForInput={waitingForInput}
            mode={mode}
          />
        );
      case 'ToolbarComponent':
        return <Toolbar onRunCode={handleRunCode} loading={loading} mode={mode} />;
      case 'GraphOutputComponent':
        return <GraphOutput graphBase64={outputPyodideGraph} mode={mode} />;
      default:
        return <div>Componente no definido: {component}</div>;
    }
  }, [editors, outputPyodideHistory, provideInput, waitingForInput, handleRunCode, loading, mode]);

  return (
    <div className={`sandbox-container ${mode}`}>
      <TopNavBar onRunCode={handleRunCode} loading={loading} objetivoEjercicio={exercise.prompt} downloadCodes={downloadCodes}/>
      <div className="flexlayout-wrapper">
        <Layout ref={layoutRef} model={model} factory={factory} className="flexlayout-container" />
      </div>
    </div>
  );
};

export default Exercise;
