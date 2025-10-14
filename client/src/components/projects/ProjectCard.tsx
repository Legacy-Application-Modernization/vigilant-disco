import type { FC } from 'react';
import { Download, Settings } from 'lucide-react';
import type { Project } from '../../types/project';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
          <span 
            className={`px-2 py-1 text-xs font-semibold rounded-full 
              ${project.status === 'Completed' 
                ? 'bg-green-100 text-green-800' 
                : project.status === 'In Progress' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}
          >
            {project.status}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600">{project.description}</p>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                project.status === 'Completed' 
                  ? 'bg-green-500' 
                  : project.status === 'In Progress' 
                    ? 'bg-blue-500' 
                    : 'bg-yellow-500'
              }`}
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-md">
              {project.framework}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Updated {project.lastUpdated}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex justify-between">
        <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
          View Details
        </button>
        <div className="flex space-x-2">
          <button className="text-gray-500 hover:text-gray-700">
            <Download className="h-4 w-4" />
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;