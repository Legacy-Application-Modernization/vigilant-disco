import { Search, Filter, ChevronRight } from 'lucide-react';
import type { Project } from '../../types/project';
import ProjectCard from './ProjectCard';
import type { FC } from 'react';
const Projects: FC = () => {
  // Sample projects data
  const projects: Project[] = [
    {
      id: 1,
      name: 'E-commerce API',
      description: 'Laravel e-commerce API migrated to Express.js',
      lastUpdated: 'Oct 12, 2025',
      status: 'Completed',
      progress: 100,
      framework: 'Laravel'
    },
    {
      id: 2,
      name: 'CRM System',
      description: 'Customer relationship management system conversion',
      lastUpdated: 'Oct 10, 2025',
      status: 'In Progress',
      progress: 65,
      framework: 'Laravel'
    },
    {
      id: 3,
      name: 'Blog Platform',
      description: 'Wordpress-like blog platform migration',
      lastUpdated: 'Oct 8, 2025',
      status: 'Completed',
      progress: 100,
      framework: 'CodeIgniter'
    },
    {
      id: 4,
      name: 'Payment Gateway',
      description: 'Payment processing service integration',
      lastUpdated: 'Oct 5, 2025',
      status: 'Needs Review',
      progress: 92,
      framework: 'Symfony'
    },
    {
      id: 5,
      name: 'User Authentication',
      description: 'OAuth2 implementation for user auth',
      lastUpdated: 'Oct 3, 2025',
      status: 'Completed',
      progress: 100,
      framework: 'Laravel'
    },
    {
      id: 6,
      name: 'Content Management',
      description: 'CMS system with admin dashboard',
      lastUpdated: 'Oct 1, 2025',
      status: 'In Progress',
      progress: 48,
      framework: 'CakePHP'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center">
          New Project <ChevronRight className="ml-1 h-4 w-4" />
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search projects..."
          />
        </div>
        <div className="flex space-x-4">
          <select className="text-sm border-gray-300 rounded-md">
            <option>All Statuses</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Needs Review</option>
          </select>
          <select className="text-sm border-gray-300 rounded-md">
            <option>All Frameworks</option>
            <option>Laravel</option>
            <option>CodeIgniter</option>
            <option>Symfony</option>
            <option>CakePHP</option>
          </select>
          <button className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 flex items-center bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-1" />
            More Filters
          </button>
        </div>
      </div>
      
      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow sm:px-6">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">6</span> of{' '}
              <span className="font-medium">12</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Previous</span>
                Previous
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-indigo-500 bg-indigo-50 text-sm font-medium text-indigo-600">
                1
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Next</span>
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;