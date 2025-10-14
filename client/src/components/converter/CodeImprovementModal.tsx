// components/converter/CodeImprovementModal.tsx
import {  useState } from 'react';

import type { FC  } from 'react';
import { X } from 'lucide-react';
import CodeEditor from './CodeEditor';

interface CodeImprovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalCode: string;
  currentCode: string;
  onSaveImprovement: (improvedCode: string) => void;
  mcpService: any;
}

const CodeImprovementModal: FC<CodeImprovementModalProps> = ({
  isOpen,
  onClose,
  originalCode,
  currentCode,
  onSaveImprovement,
  mcpService
}) => {
  // originalCode will be used in future comparison features
  console.debug('Original code length:', originalCode?.length);
  const [editedCode, setEditedCode] = useState(currentCode);
  const [isLoading, setIsLoading] = useState(false);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [selectedImprovement, setSelectedImprovement] = useState<string | null>(null);
  const [improvementType, setImprovementType] = useState<string>('performance');
  
  if (!isOpen) return null;
  
  // Request AI improvement
  const requestImprovement = async () => {
    setIsLoading(true);
    try {
      const response = await mcpService.getSuggestions(editedCode, improvementType);
      setImprovements(response);
      if (response.length > 0) {
        setSelectedImprovement(response[0]);
      }
    } catch (error) {
      console.error('Error getting improvement suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply selected improvement
  const applyImprovement = () => {
    if (selectedImprovement) {
      setEditedCode(selectedImprovement);
    }
  };
  
  // Save final improved code
  const saveImprovement = () => {
    onSaveImprovement(editedCode);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Improve Code</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4 flex flex-col">
          {/* Improvement Options */}
          <div className="flex items-center mb-4 space-x-4">
            <label className="text-sm font-medium">Improvement Focus:</label>
            <select 
              value={improvementType}
              onChange={(e) => setImprovementType(e.target.value)}
              className="border-gray-300 rounded-md text-sm"
            >
              <option value="performance">Performance</option>
              <option value="readability">Readability</option>
              <option value="bestPractices">Best Practices</option>
              <option value="errorHandling">Error Handling</option>
              <option value="typescript">Convert to TypeScript</option>
            </select>
            <button 
              onClick={requestImprovement}
              disabled={isLoading}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {isLoading ? 'Generating...' : 'Generate Suggestions'}
            </button>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <h3 className="text-sm font-medium mb-2">Edit Code</h3>
              <div className="flex-1">
                <CodeEditor 
                  code={editedCode}
                  language="javascript"
                  onChange={setEditedCode}
                />
              </div>
            </div>
            
            <div className="flex flex-col">
              <h3 className="text-sm font-medium mb-2">Suggested Improvements</h3>
              {improvements.length > 0 ? (
                <div className="flex-1 border border-gray-200 rounded overflow-auto">
                  <div className="divide-y divide-gray-200">
                    {improvements.map((improvement, index) => (
                      <div 
                        key={index}
                        className={`p-3 cursor-pointer text-sm ${selectedImprovement === improvement ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                        onClick={() => setSelectedImprovement(improvement)}
                      >
                        <div className="font-medium text-xs text-gray-500 mb-1">Suggestion {index + 1}</div>
                        <pre className="whitespace-pre-wrap font-mono text-xs">{improvement.substring(0, 100)}...</pre>
                      </div>
                    ))}
                  </div>
                  
                  {selectedImprovement && (
                    <div className="p-3 border-t border-gray-200">
                      <button 
                        onClick={applyImprovement}
                        className="w-full py-1 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200"
                      >
                        Apply Selected Suggestion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center border border-gray-200 rounded text-gray-500 text-sm">
                  {isLoading 
                    ? 'Generating suggestions...' 
                    : 'Click "Generate Suggestions" to get AI improvement recommendations'}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200 space-x-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={saveImprovement}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeImprovementModal;