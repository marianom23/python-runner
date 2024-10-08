import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Layout, Model } from 'flexlayout-react';
import { useSelector } from 'react-redux';
import { layoutModelJson } from '../utils/layoutModelJson';
import useFlexLayoutTheme from '../hooks/useFlexLayoutTheme';
// import BlocklyComponent from '../blockly/BlocklyComponent';
import Swal from 'sweetalert2';
import TopNavBar from '../components/TopNavBar';
import Editor from '../components/Editor';
import TerminalOutput from '../components/TerminalOutput';
import usePyodide from '../hooks/usePyodide';
import './Sandbox.css';
import 'flexlayout-react/style/light.css';
import terminalIcon from '../assets/images/terminal.svg';
import folderIcon from '../assets/images/folder.svg';
import GraphOutput from '../components/GraphOutput';
import NavigationComponent from '../components/NavigationComponent';

const Sandbox = () => {
  const { runPythonCode, loading, outputPyodideHistory, outputPyodideGraph, waitingForInput, provideInput, editors, setEditors } = usePyodide();
  const [closedFiles, setClosedFiles] = useState([]); // Archivos cerrados
  const layoutRef = useRef(null);
  const mode = useSelector((state) => state.theme.mode);
  const modelJson = useMemo(() => layoutModelJson(terminalIcon, folderIcon), []);
  const model = useMemo(() => Model.fromJson(modelJson), [modelJson]);


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

  // Función para manejar el cierre de pestañas
  const handleTabClose = (node) => {
    const editorId = node.getName();
    const editorData = editors.find((editor) => editor.id === editorId);

    if (editorData) {
      // Mostrar un diálogo de confirmación
      Swal.fire({
        title: '¿Desea eliminar o minimizar?',
        text: 'Puede eliminar el archivo o simplemente minimizarlo.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Minimizar',
      }).then((result) => {
        if (result.isConfirmed) {
          // Eliminar editor de la lista de editores
          setEditors((prevEditors) =>
            prevEditors.filter((editor) => editor.id !== editorId)
          );
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // Solo minimizar, no hacer nada con la lista de editores
          setClosedFiles((prev) => [...prev, editorData]); // Guardar archivo cerrado
        }
      });
    }
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
      await runPythonCode(editors);
    };
  
    useFlexLayoutTheme(mode);
  
    // Función para añadir un nuevo editor con un nombre personalizado
    const addEditor = useCallback((nombreEditor) => {
      if (layoutRef.current) {
        layoutRef.current.addTabToTabSet("#3a8361ce-881c-44d6-827c-487d1fcdb066", {
          type: "tab",
          component: "EditorComponent",
          name: nombreEditor,
          enableClose: true, // Permitir cerrar para nuevos editores
        });
        setEditors([...editors, { id: nombreEditor, code: '' }]);
      }
    }, [editors]);
  
  
    // Crear el primer editor automáticamente al iniciar la app
    useEffect(() => {
      if (layoutRef.current) {
        layoutRef.current.addTabToTabSet("#3a8361ce-881c-44d6-827c-487d1fcdb066", {
          type: "tab",
          component: "EditorComponent",
          name: `mainPy`,
          enableClose: false, // First editor cannot be closed
        });
        setEditors([{ id: 'mainPy', code: '' }]); // Initialize the first editor
      }
    }, []);

  const factory = useCallback((node) => {
    const component = node.getComponent();

    // Escuchar el evento de cierre de la pestaña directamente en el nodo
    node.setEventListener("close", () => {
      handleTabClose(node); // Llama a tu función de cierre de pestaña
    });

    switch (component) {
      case 'EditorComponent': {
        const editorId = node.getName();
        const editorData = editors?.find((editor) => editor.id === editorId);
        return (
          <Editor
            value={editorData ? editorData.code : ''}
            onChange={(newCode) => handleCodeChange(editorId, newCode)}
            mode={mode}
          />
        );
      }
      case 'TerminalOutputComponent':
        return (
          <TerminalOutput
            history={outputPyodideHistory}
            onInputSubmit={provideInput}
            waitingForInput={waitingForInput}
            mode={mode}
          />
        );
      case 'ToolbarComponent':
        return <Toolbar onRunCode={handleRunCode} loading={loading} mode={mode} />;
      case 'GraphOutputComponent':
        return <GraphOutput graphBase64={outputPyodideGraph} mode={mode} />;
      case 'NavigationComponent': 
        return <NavigationComponent closedFiles={closedFiles} restoreFile={restoreFile} mode={mode} deleteFile={deleteFile}/>;
      default:
        return <div>Componente no definido: {component}</div>;
    }
  }, [editors, outputPyodideHistory, provideInput, waitingForInput, handleRunCode, loading, mode, closedFiles]);

  // Función para restaurar un archivo cerrado
  const restoreFile = useCallback((file) => {
    if (layoutRef.current) {
      layoutRef.current.addTabToTabSet("#3a8361ce-881c-44d6-827c-487d1fcdb066", {
        type: "tab",
        component: "EditorComponent",
        name: file.id,
        enableClose: true,
      });
      // setEditors((prevEditors) => [...prevEditors, file]); // Restaurar el archivo en la lista de editores
      setClosedFiles((prev) => prev.filter((f) => f.id !== file.id)); // Eliminar el archivo de la lista de archivos cerrados
    }
  }, [setEditors]);

  // Función para eliminar un archivo cerrado
  const deleteFile = useCallback((fileId) => {
    setClosedFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    setEditors((prevEditors) => prevEditors.filter((editor) => editor.id !== fileId)); // Eliminar del estado de editores
  }, []);


  return (
    <div className={`sandbox-container ${mode}`}>
      <TopNavBar onRunCode={handleRunCode} loading={loading} addEditor={addEditor} downloadCodes={downloadCodes}/>
      <div className="flexlayout-wrapper">
        <Layout ref={layoutRef} model={model} factory={factory} onCloseTab={handleTabClose} className="flexlayout-container" />
      </div>
    </div>
  );
};

export default Sandbox;