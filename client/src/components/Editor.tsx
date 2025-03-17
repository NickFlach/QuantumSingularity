import { FC, useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import { registerSingularisLanguage } from '@/lib/SingularisParser';

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
  onElementSelect: (element: string) => void;
}

const Editor: FC<EditorProps> = ({ code, onChange, onElementSelect }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      registerSingularisLanguage();
      
      const editor = monaco.editor.create(editorRef.current, {
        value: code,
        language: 'singularis',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: {
          enabled: false
        },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: '"JetBrains Mono", monospace',
        lineNumbers: 'on',
        wordWrap: 'on',
        renderLineHighlight: 'all',
        contextmenu: true,
        scrollbar: {
          useShadows: false,
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10
        }
      });

      monacoEditorRef.current = editor;
      
      // Listen for content changes
      editor.onDidChangeModelContent(() => {
        const value = editor.getValue();
        onChange(value);
      });
      
      // Handle cursor position changes to update documentation
      editor.onDidChangeCursorPosition((e) => {
        const model = editor.getModel();
        if (!model) return;
        
        const position = e.position;
        const wordAtPosition = model.getWordAtPosition(position);
        
        if (wordAtPosition) {
          const word = wordAtPosition.word;
          // Check if the word is a known element that has documentation
          const knownElements = ['quantumKey', 'entangle', 'contract', 'deployModel', 'syncLedger', 'resolveParadox'];
          if (knownElements.includes(word)) {
            onElementSelect(word);
          }
        }
      });
      
      // Clean up
      return () => {
        editor.dispose();
      };
    }
  }, []);
  
  // Update editor content if code prop changes from external source
  useEffect(() => {
    if (monacoEditorRef.current) {
      const currentValue = monacoEditorRef.current.getValue();
      if (currentValue !== code) {
        monacoEditorRef.current.setValue(code);
      }
    }
  }, [code]);

  return (
    <div className="flex-grow overflow-hidden">
      <div ref={editorRef} className="h-full w-full" />
    </div>
  );
};

export default Editor;
