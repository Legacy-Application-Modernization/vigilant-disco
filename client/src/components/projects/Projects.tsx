import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import ProjectCard from './ProjectCard';

interface ProjectsProps {
  onNewConversion: () => void;
}

const Projects: React.FC<ProjectsProps> = ({ onNewConversion }) => {
  const { projects, loading, error, updateProject, deleteProject } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter projects based on search
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
      } catch (error: any) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">Loading projects...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          Error loading projects: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <button 
          onClick={onNewConversion}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </button>
      </div>
      
      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Search projects..."
        />
      </div>
      
      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <Plus className="mx-auto h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-sm text-gray-500 mb-6">
                Create your first legacy modernization project to get started transforming your code.
              </p>
              <button 
                onClick={onNewConversion}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onDelete={handleDeleteProject}
              onUpdate={updateProject}
            />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {filteredProjects.length > 0 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow sm:px-6">
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredProjects.length}</span> of{' '}
                <span className="font-medium">{projects.length}</span> results
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;