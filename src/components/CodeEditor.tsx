import Editor from '@monaco-editor/react';
import { Box } from '@chakra-ui/react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export interface EditorRef {
  editor: any;
  formatCode: () => void;
}

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
  onMount?: () => void;
}

export const CodeEditor = forwardRef<EditorRef, CodeEditorProps>(({ language, value, onChange, onMount }, ref) => {
  const editorRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  const formatCode = () => {
    if (editorRef.current && isReady) {
      try {
        editorRef.current.getAction('editor.action.formatDocument').run();
      } catch (error) {
        console.error('[CodeEditor] Error during format:', error);
      }
    }
  };

  const handleEditorDidMount = (editor: any) => {
    try {
      console.log('[CodeEditor] Editor mounted');
      editorRef.current = editor;
      
      // Verify we have a valid editor instance
      if (!editor || typeof editor.getModel !== 'function') {
        console.error('[CodeEditor] Invalid editor instance');
        return;
      }

      const model = editor.getModel();
      if (!model) { 
        console.error('[CodeEditor] No editor model available');
        return;
      }

      // Set up change handler
      editor.onDidChangeModelContent(() => {
        const newValue = editor.getValue();
        onChange(newValue);
      });

      // Only mark as ready if we have both editor and model
      setIsReady(true);
      
      // Call onMount callback if provided
      onMount?.();
    } catch (error) {
      console.error('[CodeEditor] Error during editor mount:', error);
    }
  };

  // Expose the editor instance and format function to parent
  useImperativeHandle(ref, () => ({
    editor: editorRef.current,
    formatCode
  }), [formatCode]);

  // Update editor value when it changes
  useEffect(() => {
    if (!isReady || !editorRef.current) return;

    const currentValue = editorRef.current.getValue();
    if (currentValue !== value) {
      editorRef.current.setValue(value);
    }
  }, [value, isReady]);

  return (
    <Box height="100%" width="100%">
      <Editor
        height="100%"
        defaultLanguage={language}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          formatOnPaste: false,
          formatOnType: false,
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: false,
          wordWrap: 'on',
          wrappingIndent: 'indent',
          autoIndent: 'advanced',
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true }
        }}
      />
    </Box>
  );
});

CodeEditor.displayName = 'CodeEditor';
