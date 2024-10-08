import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from '@codemirror/basic-setup';
import { python } from '@codemirror/lang-python';
import './Editor.css';

const Editor = ({ value, onChange, mode, readOnly }) => {
  const editorRef = useRef(null);
  const editorViewRef = useRef(null);

  // Inicializamos CodeMirror una vez
  useEffect(() => {
    if (editorRef.current && !editorViewRef.current) {
      const startState = EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          python(),
          EditorView.updateListener.of((update) => {
            if (update.changes) {
              onChange(update.state.doc.toString());
            }
          }),
          EditorView.editable.of(!readOnly), // Hacer el editor no editable si readOnly es true
        ],
      });

      editorViewRef.current = new EditorView({
        state: startState,
        parent: editorRef.current,
      });
    }

    return () => {
      if (editorViewRef.current) {
        editorViewRef.current.destroy();
      }
    };
  }, []); // Solo se inicializa una vez al cargar el componente

  // Este useEffect maneja los cambios en el valor de "value"
  useEffect(() => {
    if (editorViewRef.current) {
      const currentDoc = editorViewRef.current.state.doc.toString();
      if (currentDoc !== value) {
        editorViewRef.current.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: value }
        });
      }
    }
  }, [value]);

  return <div className={`editor ${mode}`} ref={editorRef}></div>;
};

export default Editor;
