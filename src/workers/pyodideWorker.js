// public/pyodideWorker.js

// Cargar Pyodide usando importScripts
import 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';

let pyodide = null;
let isLoading = false;
let interruptBuffer = null;
let stdinBuffer = null;
// Función para cargar Pyodide y los paquetes necesarios
const loadPyodideAndPackages = async (payload) => {
  if (pyodide === null) {
    isLoading = true;
    postMessage({ type: 'status', message: 'Cargando Pyodide...' });
    try {
      
      interruptBuffer = new Int32Array(payload.interruptBuffer);
      stdinBuffer = new Uint8Array(payload.stdinBuffer);

      pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
      });
      postMessage({ type: 'status', message: 'Pyodide cargado.' });

      pyodide.setInterruptBuffer(interruptBuffer);  // Configura el buffer de interrupción

      // Definir la función input para manejar la entrada de manera asincrónica
      pyodide.globals.set("input", (inputPrompt) => {

        self.postMessage({ type: 'requestInput', payload: inputPrompt });

        // Reiniciar el buffer compartido a 0 antes de esperar
        interruptBuffer[0] = 0;
    
        // Pausar la ejecución hasta recibir input (esperar que se modifique interruptBuffer)
        Atomics.wait(interruptBuffer, 0, 0);

        // Una vez desbloqueado, verificar si el buffer tiene datos
        if (stdinBuffer[0] !== 0) {
          // Convertir el contenido del buffer a una cadena
          let inputStr = '';
          for (let i = 0; i < stdinBuffer.length; i++) {
            if (stdinBuffer[i] === 0) break;  // Detectar final de la cadena
            inputStr += String.fromCharCode(stdinBuffer[i]);
          }
          console.log("Input entregado a Pyodide:", inputStr);
    
          // Reiniciar el buffer para futuras entradas
          stdinBuffer.fill(0);
          
          return inputStr;
        }

      });

      const packages = ['pandas', 'numpy', 'matplotlib', 'scipy'];
      postMessage({ type: 'status', message: 'Cargando paquetes de Pyodide...' });
      await pyodide.loadPackage(packages);
      postMessage({ type: 'status', message: 'Paquetes cargados.' });
    } catch (error) {
      postMessage({ type: 'error', payload: `Error al cargar Pyodide o paquetes: ${error.message}` });
    } finally {
      isLoading = false;
      postMessage({ type: 'loaded' });
    }
  }
};

// Función para ejecutar código Python
const runPythonCode = async (editors, mainFileName) => {

  if (isLoading || pyodide === null) {
    postMessage({ type: 'error', payload: 'Pyodide aún se está cargando.' });
    return;
  }

  try {
    // Eliminar archivos existentes
    const deleteFileIfExists = (filePath) => {
      try {
        if (pyodide.FS.lookupPath(filePath).node) {
          pyodide.FS.unlink(filePath);
          console.log(`Archivo eliminado: ${filePath}`);
        }
      } catch (error) {
        console.warn(`No se pudo eliminar ${filePath}:`, error);
      }
    };
  
    editors.forEach(editor => {
      deleteFileIfExists(`/home/pyodide/${editor.id}.py`);
    });
  
    // Escribir archivos en el sistema de archivos de Pyodide
    editors.forEach(editor => {
      const fileName = `${editor.id}.py`;
      pyodide.FS.writeFile(fileName, editor.code);
    });
  
    // Ejecutar el código principal
    const result = await pyodide.runPythonAsync(`
      import sys
      import io
      import builtins
      import matplotlib.pyplot as plt
      import base64
      import importlib
      import traceback
      import matplotlib
      # Configura matplotlib para usar el backend 'Agg', que no requiere entorno gráfico interactivo
      matplotlib.use('Agg')

      # Invalida los cachés de importación
      importlib.invalidate_caches()
    
      python_output = []
      python_errors = []
      input_queue = []
    
      class OutputRedirector(io.StringIO):
          def write(self, text):
              if text.strip():
                  python_output.append(text)
    
      sys.stdout = OutputRedirector()
      sys.stderr = OutputRedirector()
    
      # Crear una lista de módulos a eliminar basándose en los nombres de los editores
      editor_modules = [editor_id for editor_id in [${editors.map(editor => `'${editor.id}'`).join(', ')}]]
      
      for module in editor_modules:
          if module in sys.modules:
              del sys.modules[module]
    
      importlib.invalidate_caches()
  
      # Sobrescribir input para que sea capturado y manejado asincrónicamente
      def custom_input(prompt):
          return input(prompt)  # Aquí no llamamos a builtins.input, sino a la función global input

      builtins.input = custom_input  # Reemplazar la función input global por nuestra implementación

      try:
          # Importar y ejecutar el módulo principal
          mainPy = importlib.import_module('mainPy')
      except Exception:
          # Capturar el traceback y agregarlo a python_errors
          python_errors.append(traceback.format_exc())
    
      finally:
          # Limpiar módulos después de la ejecución
          for module in editor_modules:
              if module in sys.modules:
                  del sys.modules[module]
    
          # Restaurar stdout y stderr
          del sys.stdout
          del sys.stderr
          sys.stdout = sys.__stdout__
          sys.stderr = sys.__stderr__
    
          image_data = None
          # Asegurarse de que el código de gráficos se ejecuta aunque ocurra un error
          if plt.get_fignums():
              buf = io.BytesIO()
              plt.savefig(buf, format='png')
              buf.seek(0)
              img_data = base64.b64encode(buf.read()).decode('utf-8')
              buf.close()
              plt.close('all')
              image_data = img_data
    
      # Devuelve tanto la salida como los errores por separado
      ('\\n'.join(python_output), '\\n'.join(python_errors), image_data)
    `);

    // Desestructurar el resultado para obtener output, errores y imageData
    const [output, errors, imageData] = result;

    console.log("output", output);
    console.log("errors", errors);

    // Enviar mensajes según el resultado
    if (errors) {
      postMessage({ type: 'error', payload: errors });
    } else {
      postMessage({ type: 'output', payload: { output, imageData } });
    }
  
  } catch (error) {
    console.log(error);
  }
};

// Manejar mensajes entrantes desde el hilo principal
self.onmessage = async (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'LOAD_PYODIDE':
      await loadPyodideAndPackages(payload);
      break;

    case 'RUN_CODE':
      if (payload && payload.editors) {
        runPythonCode(payload.editors, payload.mainFileName);
      } else {
        postMessage({ type: 'error', payload: 'No se proporcionaron editores para ejecutar.' });
      }
      break;

    default:
      console.log("Tipo de mensaje desconocido:", type);
      break;  
  }
};
