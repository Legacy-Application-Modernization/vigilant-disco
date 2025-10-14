// components/converter/CodeTransformation.tsx
import { useState } from 'react';
import type { FC } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Edit, RefreshCw, File, Check, Save } from 'lucide-react';
import type { ConversionOptions } from '../../types/conversion';
import CodeEditor from './CodeEditor'; // New component we'll create

interface ConvertedFile {
  id: string;
  name: string;
  originalPath: string;
  newPath: string;
  originalCode: string;
  transformedCode: string;
  editedCode?: string; // Track edits separately
  status: 'success' | 'warning' | 'error';
  isEditing: boolean;
}

interface CodeTransformationProps {
  originalCode: string;
  transformedCode: string;
  options: ConversionOptions;
  // Commented out since it's not used, but kept for future implementation
  // setOptions: Dispatch<SetStateAction<ConversionOptions>>;
  onReviewChanges: (editedFiles: ConvertedFile[]) => void;
  mcpService?: any; // Optional MCP service for improvements
}

const CodeTransformation: FC<CodeTransformationProps> = ({ 
  originalCode,
  transformedCode,
  options,
  onReviewChanges,
  mcpService
}) => {
  // Convert the sample files to include editing state
  const initialConvertedFiles: ConvertedFile[] = [
    // Sample files from before, with added isEditing: false to each
    {
      id: '1',
      name: 'UserController.php → userController.js',
      originalPath: 'app/Http/Controllers/UserController.php',
      newPath: 'src/controllers/userController.js',
      originalCode,
      transformedCode,
      status: 'success',
      isEditing: false
    },
    // ... other files
  ];
  
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>(initialConvertedFiles);
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);
  const [isImproving, setIsImproving] = useState<Record<string, boolean>>({});
  
  const toggleFileExpansion = (fileId: string) => {
    if (expandedFileId === fileId) {
      setExpandedFileId(null);
    } else {
      setExpandedFileId(fileId);
    }
  };
  
  const toggleEditing = (fileId: string) => {
    setConvertedFiles(files => 
      files.map(file => 
        file.id === fileId 
          ? { ...file, isEditing: !file.isEditing, editedCode: file.editedCode || file.transformedCode } 
          : file
      )
    );
  };
  
  const saveEdits = (fileId: string, newCode: string) => {
    setConvertedFiles(files => 
      files.map(file => 
        file.id === fileId 
          ? { ...file, transformedCode: newCode, editedCode: newCode, isEditing: false } 
          : file
      )
    );
  };
  
  const cancelEdits = (fileId: string) => {
    setConvertedFiles(files => 
      files.map(file => 
        file.id === fileId 
          ? { ...file, isEditing: false } 
          : file
      )
    );
  };
  
  const improveCode = async (fileId: string) => {
    const file = convertedFiles.find(f => f.id === fileId);
    if (!file || !mcpService) return;
    
    try {
      // Mark this file as improving
      setIsImproving(prev => ({ ...prev, [fileId]: true }));
      
      // Request improved code from MCP service
      const improvedCode = await mcpService.improveCode(
        file.originalCode,
        file.transformedCode,
        {
          fileName: file.name,
          originalPath: file.originalPath,
          newPath: file.newPath,
          ...options // Pass transformation options
        }
      );
      
      // Update the file with improved code
      setConvertedFiles(files => 
        files.map(f => 
          f.id === fileId 
            ? { ...f, transformedCode: improvedCode, editedCode: improvedCode } 
            : f
        )
      );
    } catch (error) {
      console.error('Failed to improve code:', error);
      // Show error notification
    } finally {
      setIsImproving(prev => ({ ...prev, [fileId]: false }));
    }
  };
  
  const revertToOriginal = (fileId: string) => {
    // Find the file in our initial state
    const originalFile = initialConvertedFiles.find(f => f.id === fileId);
    if (!originalFile) return;
    
    // Revert to original transformation
    setConvertedFiles(files => 
      files.map(file => 
        file.id === fileId 
          ? { ...file, transformedCode: originalFile.transformedCode, editedCode: undefined, isEditing: false } 
          : file
      )
    );
  };
  
  const getStatusColor = (status: ConvertedFile['status']) => {
    switch (status) {
      case 'success': return 'text-emerald-500';
      case 'warning': return 'text-amber-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Code Transformation</h2>
      
      <div className="mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Converted Files</h3>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full">
              {convertedFiles.length} files transformed
            </span>
          </div>
          
          <div className="space-y-2">
            {convertedFiles.map((file) => (
              <div key={file.id} className="bg-white rounded-lg shadow-sm">
                {/* File Header */}
                <div 
                  className={`p-4 cursor-pointer flex items-center justify-between ${expandedFileId === file.id ? 'border-b border-gray-200' : ''}`}
                  onClick={() => toggleFileExpansion(file.id)}
                >
                  <div className="flex items-center">
                    <File size={18} className={getStatusColor(file.status)} />
                    <span className="ml-2 font-medium">{file.name}</span>
                    {file.editedCode && (
                      <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded">
                        Edited
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Check size={16} className={getStatusColor(file.status)} />
                    <ChevronDown 
                      size={16} 
                      className={`ml-2 transition-transform ${expandedFileId === file.id ? 'rotate-180' : ''}`} 
                    />
                  </div>
                </div>
                
                {/* Expanded File Content */}
                {expandedFileId === file.id && (
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-gray-500">
                      <div>Original Path: <span className="font-mono">{file.originalPath}</span></div>
                      <div>New Path: <span className="font-mono">{file.newPath}</span></div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end mb-4 space-x-2">
                      {!file.isEditing ? (
                        <>
                          <button 
                            className="px-3 py-1 text-xs bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 flex items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEditing(file.id);
                            }}
                          >
                            <Edit size={14} className="mr-1" /> Edit Code
                          </button>
                          
                          <button 
                            className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 flex items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              improveCode(file.id);
                            }}
                            disabled={isImproving[file.id]}
                          >
                            <RefreshCw size={14} className={`mr-1 ${isImproving[file.id] ? 'animate-spin' : ''}`} /> 
                            {isImproving[file.id] ? 'Improving...' : 'Improve Code'}
                          </button>
                          
                          {file.editedCode && (
                            <button 
                              className="px-3 py-1 text-xs bg-amber-50 text-amber-700 rounded hover:bg-amber-100 flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                revertToOriginal(file.id);
                              }}
                            >
                              <RefreshCw size={14} className="mr-1" /> Revert Changes
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-indigo-600">
                          Editing Mode - Make your changes in the editor below
                        </div>
                      )}
                    </div>
                    
                    {/* Code Display or Editor */}
                    {file.isEditing ? (
                      <div className="mb-4">
                        <CodeEditor 
                          code={file.editedCode || file.transformedCode}
                          language="javascript"
                          onChange={(code) => {
                            // Update the edited code while editing
                            setConvertedFiles(files => 
                              files.map(f => 
                                f.id === file.id 
                                  ? { ...f, editedCode: code } 
                                  : f
                              )
                            );
                          }}
                        />
                        <div className="flex justify-end mt-4 space-x-2">
                          <button 
                            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelEdits(file.id);
                            }}
                          >
                            Cancel
                          </button>
                          <button 
                            className="px-3 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 flex items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              saveEdits(file.id, file.editedCode || file.transformedCode);
                            }}
                          >
                            <Save size={14} className="mr-1" /> Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-lg overflow-hidden">
                          <div className="bg-indigo-500 text-white py-2 px-4 text-sm">
                            Original PHP Code
                          </div>
                          <pre className="bg-gray-900 text-gray-100 p-4 h-80 overflow-auto text-sm">
                            {file.originalCode}
                          </pre>
                        </div>
                        
                        <div className="rounded-lg overflow-hidden">
                          <div className="bg-indigo-500 text-white py-2 px-4 text-sm flex justify-between items-center">
                            <span>Transformed Node.js Code</span>
                            {file.editedCode && (
                              <span className="text-xs bg-white text-indigo-500 px-2 py-0.5 rounded">
                                Edited
                              </span>
                            )}
                          </div>
                          <pre className="bg-gray-900 text-gray-100 p-4 h-80 overflow-auto text-sm">
                            {file.transformedCode}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Transformation Options */}
      {/* ... (same as before) ... */}
      
      <div className="flex justify-between">
        <button className="text-indigo-500 px-6 py-2 rounded-md hover:bg-indigo-50 transition-colors flex items-center">
          <ChevronLeft size={18} className="mr-1" /> Back
        </button>
        
        <button 
          onClick={() => onReviewChanges(convertedFiles)}
          className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 transition-colors flex items-center"
        >
          Review Changes <ChevronRight size={18} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default CodeTransformation;