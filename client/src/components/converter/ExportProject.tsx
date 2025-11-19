import { useState, type FC } from 'react';
import { Archive, Link as LinkIcon, Server, Cloud, ChevronLeft, CheckCircle, Loader2 } from 'lucide-react';
import type { FileStructure } from '../../types/conversion';
import apiService from '../../services/api';

interface ExportProjectProps {
  fileStructure: FileStructure[];
  onBack?: () => void;
  onComplete?: () => void;
}

const ExportProject: FC<ExportProjectProps> = ({ fileStructure, onBack, onComplete }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSaveProject = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Get repository data from localStorage
      const storedRepo = localStorage.getItem('selectedRepository');
      const analysisResult = localStorage.getItem('cachedAnalysisResult');
      const conversionPlanner = localStorage.getItem('cachedConversionPlanner');
      const transformationData = localStorage.getItem('cachedTransformationData');

      let repoData: any = {};
      if (storedRepo) {
        repoData = JSON.parse(storedRepo);
      }

      // Prepare project data
      const projectData = {
        name: repoData.name || 'PHP to Node.js Migration',
        description: `Migrated from ${repoData.url || 'PHP project'}`,
        sourceLanguage: 'PHP',
        targetLanguage: 'Node.js',
        tags: ['migration', 'php', 'nodejs'],
        settings: {
          preserveComments: true,
          modernizePatterns: true,
          optimizeCode: true,
          addDocumentation: true,
          conversionNotes: `Repository: ${repoData.url || 'N/A'}\nBranch: ${repoData.branch || 'main'}`
        },
        metadata: {
          repositoryUrl: repoData.url,
          branch: repoData.branch || 'main',
          analysisResult: analysisResult ? JSON.parse(analysisResult) : null,
          conversionPlanner: conversionPlanner ? JSON.parse(conversionPlanner) : null,
          transformationData: transformationData ? JSON.parse(transformationData) : null,
          fileStructure: fileStructure
        }
      };

      // Call API to create project
      const response = await apiService.createProject(projectData);

      if (response.success) {
        setSuccess(true);
        console.log('Project saved successfully:', response.data);
        
        // Call onComplete callback after a short delay to show success message
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 1500);
      } else {
        throw new Error(response.message || 'Failed to save project');
      }
    } catch (err: any) {
      console.error('Failed to save project:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Export Your Node.js Project</h2>
      
      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Project Saved Successfully!</h3>
              <p className="mt-1 text-sm text-green-700">Your project has been saved to your account.</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Saving Project</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600 text-xl px-2"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
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
        <button 
          onClick={onBack}
          disabled={isSaving}
          className="text-indigo-500 px-6 py-2 rounded-md hover:bg-indigo-50 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} className="mr-1" /> Back to Review
        </button>
        
        <button 
          onClick={handleSaveProject}
          disabled={isSaving || success}
          className="bg-emerald-500 text-white px-6 py-2 rounded-md hover:bg-emerald-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 size={18} className="mr-1 animate-spin" /> Saving Project...
            </>
          ) : success ? (
            <>
              <CheckCircle size={18} className="mr-1" /> Project Saved!
            </>
          ) : (
            <>
              <CheckCircle size={18} className="mr-1" /> Save & Complete Export
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExportProject;