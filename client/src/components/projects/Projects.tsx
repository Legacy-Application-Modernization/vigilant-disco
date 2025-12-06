import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import ProjectCard from './ProjectCard';
import type { ProjectStatus } from '../../types/project';

interface ProjectsProps {
  onNewConversion: () => void;
}

const Projects: React.FC<ProjectsProps> = ({ onNewConversion }) => {
  const { projects, loading, error, updateProject, deleteProject } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  // Status filter options
  const statusOptions: Array<{ value: ProjectStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All Projects' },
    { value: 'analyzing', label: 'Analyzing' },
    { value: 'analyzed', label: 'Analyzed' },
    { value: 'planning', label: 'Planning' },
    { value: 'planned', label: 'Planned' },
    { value: 'migrating', label: 'Migrating' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
  ];

  // Check if a project was just saved and highlight the most recent one
  useEffect(() => {
    const projectJustSaved = localStorage.getItem('projectJustSaved');
    
    if (projectJustSaved === 'true' && projects.length > 0) {
      // Find the most recent project (first one in the list since they're sorted by updatedAt desc)
      const mostRecentProject = projects[0];
      setHighlightedProjectId(mostRecentProject.id);
      
      // Clear the flag
      localStorage.removeItem('projectJustSaved');
      localStorage.removeItem('projectSavedAt');
      
      // Remove highlight after 5 seconds
      setTimeout(() => {
        setHighlightedProjectId(null);
      }, 5000);
    }
  }, [projects]);

  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = (project.project_name || project.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.repository_url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Count projects by status
  const statusCounts = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<ProjectStatus, number>);

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

      {/* Success banner for newly saved project */}
      {highlightedProjectId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-green-800">Project Saved Successfully!</h3>
              <p className="mt-1 text-sm text-green-700">Your project has been saved and is highlighted below.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
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
        
        {/* Status Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
            className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
                {option.value !== 'all' && statusCounts[option.value as ProjectStatus] 
                  ? ` (${statusCounts[option.value as ProjectStatus]})` 
                  : ''}
              </option>
            ))}
          </select>
        </div>
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
              highlighted={highlightedProjectId === project.id}
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