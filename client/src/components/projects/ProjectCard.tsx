import type { FC } from 'react';
import { Download, Settings, Trash2, Eye } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'in-progress' | 'completed' | 'archived';
  sourceLanguage: string;
  targetLanguage?: string;
  createdAt: string;
  updatedAt: string;
  settings: any;
  metadata?: any;
}

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void;
  onUpdate?: (projectId: string, data: any) => void;
}

const ProjectCard: FC<ProjectCardProps> = ({ project, onDelete, onUpdate }) => {
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      planning: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || statusStyles.planning}`}>
        {status.replace('-', ' ')}
      </span>
    );
  };

  const getProgressPercentage = (status: string) => {
    const progressMap = {
      planning: 25,
      'in-progress': 65,
      completed: 100,
      archived: 100
    };
    return progressMap[status as keyof typeof progressMap] || 0;
  };

  const progress = getProgressPercentage(project.status);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(project.id);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (onUpdate) {
      onUpdate(project.id, { status: newStatus });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h2>
          {getStatusBadge(project.status)}
        </div>
        
        {project.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{project.description}</p>
        )}
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-md">
              {project.sourceLanguage}
            </span>
            {project.targetLanguage && (
              <>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                  {project.targetLanguage}
                </span>
              </>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(project.updatedAt).toLocaleDateString()}
          </div>
        </div>

        {/* Tags */}
        {project.metadata?.tags && project.metadata.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {project.metadata.tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                {tag}
              </span>
            ))}
            {project.metadata.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{project.metadata.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex justify-end items-center">
        <div className="flex space-x-2">
          <button 
            className="text-gray-500 hover:text-gray-700"
            title="Download"
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
    </div>
  );
};

export default ProjectCard;