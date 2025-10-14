import type { FC } from 'react';
import { Archive, Link as LinkIcon, Server, Cloud, ChevronLeft, CheckCircle } from 'lucide-react';
import type { FileStructure } from '../../types/conversion';

interface ExportProjectProps {
  fileStructure: FileStructure[];
}

const ExportProject: FC<ExportProjectProps> = ({ fileStructure }) => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Export Your Node.js Project</h2>
      
      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Download ZIP */}
        <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center">
          <div className="bg-indigo-100 p-4 rounded-full mb-4">
            <Archive size={32} className="text-indigo-500" />
          </div>
          <h3 className="font-semibold mb-2">Download ZIP</h3>
          <p className="text-sm text-gray-500 mb-4">Complete project with all dependencies and configuration files</p>
          <button className="mt-auto bg-white text-indigo-500 border border-indigo-500 px-4 py-2 rounded-md hover:bg-indigo-50 transition-colors w-full">
            Download
          </button>
        </div>
        
        {/* GitHub Repository */}
        <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center">
          <div className="bg-indigo-100 p-4 rounded-full mb-4">
            <LinkIcon size={32} className="text-indigo-500" />
          </div>
          <h3 className="font-semibold mb-2">GitHub Repository</h3>
          <p className="text-sm text-gray-500 mb-4">Push directly to a new or existing GitHub repository</p>
          <button className="mt-auto bg-white text-indigo-500 border border-indigo-500 px-4 py-2 rounded-md hover:bg-indigo-50 transition-colors w-full">
            Connect
          </button>
        </div>
        
        {/* Docker Container */}
        <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center">
          <div className="bg-indigo-100 p-4 rounded-full mb-4">
            <Server size={32} className="text-indigo-500" />
          </div>
          <h3 className="font-semibold mb-2">Docker Container</h3>
          <p className="text-sm text-gray-500 mb-4">Dockerized application ready for deployment</p>
          <button className="mt-auto bg-white text-indigo-500 border border-indigo-500 px-4 py-2 rounded-md hover:bg-indigo-50 transition-colors w-full">
            Generate
          </button>
        </div>
        
        {/* Deploy to Cloud */}
        <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center bg-indigo-50">
          <div className="bg-indigo-100 p-4 rounded-full mb-4">
            <Cloud size={32} className="text-indigo-500" />
          </div>
          <h3 className="font-semibold mb-2">Deploy to Cloud</h3>
          <p className="text-sm text-gray-500 mb-4">One-click deploy to AWS, Heroku, or Vercel</p>
          <button className="mt-auto bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors w-full">
            Deploy
          </button>
        </div>
      </div>
      
      {/* Project Structure */}
      <div className="bg-indigo-50 rounded-lg p-6 mb-8">
        <h3 className="font-semibold mb-4">Project Structure</h3>
        <div className="bg-white p-4 rounded-lg font-mono text-sm overflow-auto max-h-80">
          {fileStructure.map((item, index) => (
            <div key={index} className="whitespace-pre">
              {'  '.repeat(item.level)}
              {item.type === 'folder' ? '📁 ' : '📄 '}
              {item.name}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button className="text-indigo-500 px-6 py-2 rounded-md hover:bg-indigo-50 transition-colors flex items-center">
          <ChevronLeft size={18} className="mr-1" /> Back to Review
        </button>
        
        <button className="bg-emerald-500 text-white px-6 py-2 rounded-md hover:bg-emerald-600 transition-colors flex items-center">
          <CheckCircle size={18} className="mr-1" /> Complete Export
        </button>
      </div>
    </div>
  );
};

export default ExportProject;