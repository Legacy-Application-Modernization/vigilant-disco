import type { FC } from 'react';
import { Upload, ChevronRight } from 'lucide-react';
import type { UploadedFile } from '../../types/conversion';

interface UploadFilesProps {
  uploadedFiles: UploadedFile[];
  onFileUpload: () => void;
  onAnalyzeCode: () => void;
}

const UploadFiles: FC<UploadFilesProps> = ({ uploadedFiles, onFileUpload, onAnalyzeCode }) => {
  // Handle file selection
  const handleFileSelect = () => {
    onFileUpload();
  };

  return (
    <div className="p-8">
      {/* Drop Zone */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 mb-6 flex flex-col items-center justify-center">
        <div className="bg-indigo-500 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <Upload size={28} />
        </div>
        <h2 className="text-xl font-semibold mb-2">Drop your PHP files here</h2>
        {/* <p className="text-gray-500 mb-4">or click to browse from your computer</p> */}
        
        <div className="flex gap-4">
          {/* <button 
            onClick={handleFileSelect}
            className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 transition-colors"
          >
            Select Files
          </button> */}
          
          <button className="bg-white text-indigo-500 border border-indigo-500 px-6 py-2 rounded-md hover:bg-indigo-50 transition-colors">
            Import from GitHub
          </button>
        </div>
        
        <div className="text-sm text-gray-400 mt-4">
          Supports: .php, .inc, .phtml files • Max file size: 10MB • Multiple files allowed
        </div>
      </div>
      
      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <>
          <h3 className="font-semibold text-xl mb-4">Uploaded Files ({uploadedFiles.length})</h3>
          <div className="space-y-3 mb-6">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="bg-indigo-100 text-indigo-500 p-2 rounded-md">
                    <span className="font-mono font-bold text-xs">PHP</span>
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-gray-500">{file.size} • {file.type}</div>
                  </div>
                </div>
                <button className="text-sm text-indigo-500 hover:text-indigo-700">
                  Remove
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={onAnalyzeCode}
              className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 transition-colors flex items-center"
            >
              Analyze Code <ChevronRight size={18} className="ml-1" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UploadFiles;