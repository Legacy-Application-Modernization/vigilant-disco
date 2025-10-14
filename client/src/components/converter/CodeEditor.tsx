// components/converter/CodeEditor.tsx
import { useEffect, useRef } from 'react';
import type { FC } from 'react';
interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
}

const CodeEditor: FC<CodeEditorProps> = ({ code, language, onChange }) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // This is a simple textarea-based editor
  // In a real app, you'd want to use Monaco Editor, CodeMirror, or Ace Editor
  // for syntax highlighting and more advanced features

  // Adjust the height of the textarea based on content
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.height = 'auto';
      editorRef.current.style.height = `${editorRef.current.scrollHeight}px`;
    }
  }, [code]);

  return (
    <div className="rounded-lg border border-gray-300 overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex justify-between">
        <span className="font-medium">Edit {language.toUpperCase()} Code</span>
        <span className="text-sm text-gray-500">Syntax highlighting disabled in edit mode</span>
      </div>
      <textarea
        ref={editorRef}
        value={code}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-96 p-4 font-mono text-sm bg-gray-900 text-gray-100 focus:outline-none"
        spellCheck="false"
      />
    </div>
  );
};

export default CodeEditor;