import { useState, useEffect, useRef } from 'react';

const usePyodide = () => {
  const [loading, setLoading] = useState(true);
  const [outputPyodideHistory, setOutputPyodideHistory] = useState([]); // Historial de salidas
  const [outputPyodideGraph, setOutputPyodideGraph] = useState('');
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [editors, setEditors] = useState([]);
  const workerRef = useRef(null);
  const interruptBufferRef = useRef(null); // UseRef for the interrupt buffer
  const stdinBufferRef = useRef(null); 

  useEffect(() => {

    // Importar el Web Worker usando la sintaxis de Webpack 5
    workerRef.current = new Worker(
      new URL('../workers/pyodideWorker.js', import.meta.url),
      { type: 'module' }
    );
    

    interruptBufferRef.current = new Int32Array(new SharedArrayBuffer(4));
    stdinBufferRef.current = new Uint8Array(new SharedArrayBuffer(1024));

    // Manejar mensajes entrantes desde el Web Worker
    workerRef.current.onmessage = (event) => {
      const { type, payload } = event.data;

      switch (type) {
        
        case 'status':
          break;

        case 'loaded':
          setLoading(false);
          break;

        case 'output':
          setOutputPyodideHistory((prevHistory) => [...prevHistory, payload.output]); // Agregar al historial
          if (payload.imageData) {
            setOutputPyodideGraph(payload.imageData);
          }
          break;

        case 'requestInput':
          console.log(type, payload);
          setOutputPyodideHistory((prevHistory) => [...prevHistory, payload]); // Agregar al historial
          setWaitingForInput(true);
          break;

        case 'error':
          setOutputPyodideHistory((prevHistory) => [...prevHistory, `Error: ${payload}`]); // Agregar al historial
          break;

        default:
          console.warn(`Mensaje desconocido del worker: ${type}`);
          break;
      }
    };

    console.log(interruptBufferRef.current.buffer);
    

    // Ensure buffer is available before posting the message to the worker
    if (interruptBufferRef.current) {
      workerRef.current.postMessage({
        type: 'LOAD_PYODIDE',
        payload: { interruptBuffer: interruptBufferRef.current.buffer, stdinBuffer: stdinBufferRef.current.buffer }, // Pass the shared buffer
      });
    } else {
      console.error('Interrupt buffer is not initialized.');
    }
    

    // Limpiar el Web Worker al desmontar el componente
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Función para ejecutar código Python
  const runPythonCode = (editorsToRun, mainFileName) => {
    if (loading) {
      setOutputPyodideHistory((prevHistory) => [...prevHistory, 'Cargando Pyodide...']); // Agregar al historial
      return;
    }

    // Enviar el código de los editores al Web Worker para su ejecución
    workerRef.current.postMessage({
      type: 'RUN_CODE',
      payload: { editors: editorsToRun, mainFileName: mainFileName },
    });
  };
 

  // Función para proporcionar input al worker y reanudar la ejecución
  const provideInput = (userInput) => {
    setWaitingForInput(false);

    // Codificar la cadena input en el buffer compartido
    const inputStr = userInput;
    const encodedInput = new TextEncoder().encode(inputStr);
    
    // Copiar los datos codificados al buffer compartido (stdinBuffer)
    for (let i = 0; i < encodedInput.length; i++) {
      stdinBufferRef.current[i] = encodedInput[i];
    }

    // Si el input es más largo que el buffer, truncarlo
    if (encodedInput.length >= stdinBufferRef.current.length) {
      console.warn("El input excede el tamaño del buffer. Se truncará.");
    }

    // Cambiar el valor en el interruptBuffer para desbloquear la espera
    interruptBufferRef.current[0] = 1;  

    // Notificar que puede continuar
    Atomics.notify(interruptBufferRef.current, 0);
  };



  return {
    loading,
    runPythonCode,
    outputPyodideHistory, // Exponer el historial
    outputPyodideGraph,
    waitingForInput,
    provideInput,
    editors,
    setEditors,
  };
};

export default usePyodide;
