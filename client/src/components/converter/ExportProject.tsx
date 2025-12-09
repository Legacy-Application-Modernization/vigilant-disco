import { useState, useEffect, type FC } from 'react';
import { Archive, ChevronLeft, CheckCircle, Loader2, Download } from 'lucide-react';
import type { FileStructure } from '../../types/conversion';
import apiService from '../../services/api';
import { cacheManager } from '../../utils/cacheManager';

interface ExportProjectProps {
  fileStructure: FileStructure[];
  onBack?: () => void;
  onComplete?: () => void;
}

const ExportProject: FC<ExportProjectProps> = ({ fileStructure, onBack, onComplete }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cachedProjectData, setCachedProjectData] = useState<any>(null);

  // Load cached project data on mount
  useEffect(() => {
    const loadCachedData = async () => {
      const cached = await cacheManager.get('exportProjectData');
      if (cached) {
        setCachedProjectData(cached);
      }
    };
    loadCachedData();
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      // Try to get the current project ID from localStorage
      let projectId = localStorage.getItem('currentProjectId');

      // If no project ID, try to find it from the repository information
      if (!projectId) {
        const storedRepo = localStorage.getItem('selectedRepository');
        if (storedRepo) {
          try {
            const repoData = JSON.parse(storedRepo);

            // Check cache first
            let projectsResponse = cachedProjectData?.projectsList;

            if (!projectsResponse) {
              projectsResponse = await apiService.getUserProjects();

              // Cache the projects list
              await cacheManager.set('exportProjectData', {
                projectsList: projectsResponse,
                timestamp: Date.now()
              });
              setCachedProjectData({ projectsList: projectsResponse, timestamp: Date.now() });
            }

            if (projectsResponse.success && projectsResponse.data?.projects) {
              // Find project matching this repository URL
              const matchingProject = projectsResponse.data.projects.find(
                (p: any) => p.repository_url === repoData.url
              );

              if (matchingProject && matchingProject.id) {
                projectId = matchingProject.id;
                // Store it for future use
                localStorage.setItem('currentProjectId', matchingProject.id);
              }
            }
          } catch (parseError) {
            console.error('Error parsing repository data:', parseError);
          }
        }
      }

      if (!projectId) {
        throw new Error('No project found. The project may still be processing. Please try again in a moment.');
      }

      // Call API to get download URL from S3
      const response = await apiService.downloadProject(projectId);

      if (response.success && response.data.downloadUrl) {
        // Create a temporary anchor element and trigger download
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = response.data.fileName || 'project.zip';
        link.target = '_blank'; // Open in new tab as backup
        link.rel = 'noopener noreferrer';

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error(response.message || 'Failed to get download URL');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to download project';
      setDownloadError(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveProject = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Project creation is now handled by code-agent-service
      // Just mark as saving and navigate to projects section
      setSuccess(true);

      // Store a flag to indicate project was just saved
      localStorage.setItem('projectJustSaved', 'true');
      localStorage.setItem('projectSavedAt', Date.now().toString());

      // Call onComplete callback after a short delay to show success message
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 1500);
    } catch (err: any) {
      console.error('Failed to save project:', err);
      setError(err.message || 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Save & Export Your Node.js Project</h2>
      
      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Project Saved Successfully!</h3>
              <p className="mt-1 text-sm text-green-700">Redirecting to Projects section where you can download your project...</p>
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
      
      {/* Download Error Message */}
      {downloadError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Downloading Project</h3>
              <p className="mt-1 text-sm text-red-700">{downloadError}</p>
            </div>
            <button
              onClick={() => setDownloadError(null)}
              className="ml-auto text-red-400 hover:text-red-600 text-xl px-2"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="flex justify-center mb-8">
        {/* Download ZIP - Direct download from S3 */}
        <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center max-w-sm w-full">
          <div className="bg-indigo-100 p-4 rounded-full mb-4">
            <Archive size={32} className="text-indigo-500" />
          </div>
          <h3 className="font-semibold mb-2">Download ZIP</h3>
          <p className="text-sm text-gray-500 mb-4">Download your converted Node.js project as a ZIP file</p>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="mt-auto bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 transition-colors w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" /> Downloading...
              </>
            ) : (
              <>
                <Download size={18} className="mr-2" /> Download ZIP
              </>
            )}
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