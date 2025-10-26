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
  const [statusFilter, setStatusFilter] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState('');

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || project.status === statusFilter;
    const matchesFramework = !frameworkFilter || project.sourceLanguage === frameworkFilter;
    
    return matchesSearch && matchesStatus && matchesFramework;
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
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1 max-w-md">
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
        <div className="flex space-x-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="planning">Planning</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          <select 
            value={frameworkFilter}
            onChange={(e) => setFrameworkFilter(e.target.value)}
            className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Languages</option>
            <option value="php">PHP</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
          </select>
          <button className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 flex items-center bg-white hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4 mr-1" />
            More Filters
          </button>
        </div>
      </div>
      
      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {projects.length === 0 ? (
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
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects match your filters</h3>
                <p className="text-sm">Try adjusting your search terms or filters to find what you're looking for.</p>
              </div>
            )}
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
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredProjects.length}</span> of{' '}
                <span className="font-medium">{projects.length}</span> results
              </p>
            </div>
            {projects.length > filteredProjects.length && (
              <div>
                <p className="text-sm text-gray-500">
                  ({projects.length - filteredProjects.length} filtered out)
                </p>
              </div>
            )}
          </div>
          <div className="sm:hidden">
            <p className="text-sm text-gray-700">
              {filteredProjects.length} of {projects.length} projects
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;