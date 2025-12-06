import type { FC } from 'react';
import { Download, Settings, Trash2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import apiService from '../../services/api';
import backendService from '../../services/backend.service';
import type { Project, ProjectStatus } from '../../types/project';

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void;
  onUpdate?: (projectId: string, data: any) => void;
  highlighted?: boolean;
}

const ProjectCard: FC<ProjectCardProps> = ({ project, onDelete, highlighted }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  
  // Use backend service for status badge styling
  const getStatusBadge = (status: ProjectStatus) => {
    const { bg, text, label } = backendService.getStatusBadgeStyle(status);
    
    return (
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
          {label}
        </span>
        {status === 'failed' && project.error && (
          <AlertCircle className="h-4 w-4 text-red-500" aria-label={project.error} />
        )}
      </div>
    );
  };
  
  // Calculate progress based on status
  const progress = backendService.getProgressPercentage(project.status);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(project.id);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      console.log('Downloading project:', project.id);
      
      // Call API to get download URL from S3
      const response = await apiService.downloadProject(project.id);
      
      if (response.success && response.data.downloadUrl) {
        console.log('Download URL received:', response.data.downloadUrl);
        
        // Create a temporary anchor element and trigger download
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = response.data.fileName || `${project.name}.zip`;
        link.target = '_blank'; // Open in new tab as backup
        link.rel = 'noopener noreferrer';
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Download initiated successfully');
      } else {
        throw new Error(response.message || 'Failed to get download URL');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to download project';
      setDownloadError(errorMessage);
      
      // Show error to user (you can use a toast notification here)
      alert(`Download failed: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-all ${
      highlighted ? 'ring-4 ring-green-400 ring-opacity-50 animate-pulse' : ''
    }`}>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {project.project_name || project.name}
          </h2>
          {getStatusBadge(project.status)}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Migration Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                project.status === 'failed' ? 'bg-red-500' : 
                project.status === 'completed' ? 'bg-green-500' : 
                'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Error Message */}
        {project.error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            <strong>Error:</strong> {project.error}
          </div>
        )}
        
        {/* Repository URL */}
        <div className="mt-3 text-sm text-gray-600">
          <a 
            href={project.repository_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 truncate block"
          >
            {project.repository_url}
          </a>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-md">
              {project.source_language || 'PHP'}
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
              {project.target_language || 'NodeJS'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(project.updated_at || project.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Timestamps */}
        <div className="mt-3 text-xs text-gray-500 space-y-1">
          <div>Created: {new Date(project.created_at).toLocaleString()}</div>
          {project.completed_at && (
            <div className="text-green-600">
              Completed: {new Date(project.completed_at).toLocaleString()}
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex justify-between items-center">
        {/* Next Step Indicator */}
        <div className="text-xs text-gray-600 italic">
          {backendService.getNextStep(project.status) || 'Ready to download'}
        </div>
        
        <div className="flex space-x-2">
          <button 
            className={`text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${isDownloading ? 'animate-pulse' : ''}`}
            title={isDownloading ? 'Downloading...' : project.status === 'completed' ? 'Download from S3' : 'Complete migration first'}
            onClick={handleDownload}
            disabled={isDownloading || project.status !== 'completed'}
          >
            <Download className="h-4 w-4" />
          </button>
          <button 
            className="text-gray-500 hover:text-gray-700"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          {onDelete && (
            <button 
              className="text-red-500 hover:text-red-700"
              title="Delete"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {downloadError && (
        <div className="px-6 py-2 bg-red-50 border-t border-red-200">
          <p className="text-xs text-red-600">{downloadError}</p>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;