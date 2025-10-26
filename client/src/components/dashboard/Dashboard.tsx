import type { FC } from 'react';
import { 
  ChevronRight, 
  FileText, 
  Code, 
  Activity, 
  Server, 
  Check,
  ArrowRight,
  Edit,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { formatDate } from '../../utils/dataUtils';

interface DashboardProps {
  onNewConversion: () => void;
}

const Dashboard: FC<DashboardProps> = ({ onNewConversion }) => {
  const { projects, loading, error } = useProjects();
  
  // Get recent projects (limit to 5 for dashboard)
  const recentProjects = projects.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center">
          <div className="md:w-2/3 mb-6 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Transform Legacy Code into Modern Applications
            </h1>
            <p className="text-indigo-100 text-lg mb-6">
              Modernize your legacy applications in minutes, not months. Our AI-powered converter transforms PHP code into clean, maintainable Node.js.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={onNewConversion}
                className="px-6 py-3 bg-white text-indigo-700 rounded-md hover:bg-indigo-50 transition-colors font-semibold shadow-sm"
              >
                Start New Conversion
              </button>
              <button className="px-6 py-3 bg-indigo-700 bg-opacity-30 text-white rounded-md hover:bg-opacity-40 transition-colors font-medium border border-indigo-200 border-opacity-30">
                Watch Demo
              </button>
            </div>
          </div>
          <div className="md:w-1/3 flex justify-center">
            <div className="bg-white bg-opacity-10 p-4 rounded-xl backdrop-blur-sm border border-indigo-300 border-opacity-30 shadow-xl transform rotate-3">
              <div className="text-xs text-indigo-200 mb-2">PHP ➝ Node.js</div>
              <pre className="text-white text-xs overflow-hidden">
                <code className="whitespace-pre-wrap">
{`// Original PHP
$users = User::all();
return response()->json($users);

// Transformed Node.js
const users = await User.findAll();
return res.json(users);`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
      
      {/* Process Visualization */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">How It Works</h2>
          <button className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
            Learn More <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText size={20} />
            </div>
            <h3 className="font-medium">1. Import PHP Files</h3>
            <p className="text-gray-500 text-sm mt-1">Import your Github PHP source code files</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity size={20} />
            </div>
            <h3 className="font-medium">2. Code Analysis</h3>
            <p className="text-gray-500 text-sm mt-1">AI analyzes patterns & dependencies</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Code size={20} />
            </div>
            <h3 className="font-medium">3. Transformation</h3>
            <p className="text-gray-500 text-sm mt-1">Convert PHP to Node.js</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Edit size={20} />
            </div>
            <h3 className="font-medium">4. Review & Edit</h3>
            <p className="text-gray-500 text-sm mt-1">Validate and refine the code</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Server size={20} />
            </div>
            <h3 className="font-medium">5. Export</h3>
            <p className="text-gray-500 text-sm mt-1">Download or deploy your project</p>
          </div>
        </div>
      </div>
      
      {/* Recent Projects with CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-500">Loading your projects...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-8 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">Failed to load projects</p>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && recentProjects.length === 0 && (
            <div className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first conversion project.</p>
              <button 
                onClick={onNewConversion}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Create First Project
              </button>
            </div>
          )}

          {/* Projects Table */}
          {!loading && !error && recentProjects.length > 0 && (
            <div className="p-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Language
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {project.name}
                          </div>
                          {project.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {project.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(project.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}
                        >
                          {formatStatus(project.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {project.sourceLanguage}
                          {project.targetLanguage && (
                            <span className="text-indigo-600">
                              {' → '}{project.targetLanguage}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Show more projects hint */}
              {projects.length > 5 && (
                <div className="px-6 py-3 bg-gray-50 border-t text-center">
                  <p className="text-sm text-gray-500">
                    Showing 5 of {projects.length} projects
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* CTA Section */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow text-white p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Ready to Modernize Your Applications?</h3>
            <p className="mb-6">Transform your legacy PHP applications into modern, scalable Node.js services in minutes.</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <Check size={16} className="mr-2" /> Increased development speed
              </li>
              <li className="flex items-center">
                <Check size={16} className="mr-2" /> Improved scalability
              </li>
              <li className="flex items-center">
                <Check size={16} className="mr-2" /> Modern security standards
              </li>
              <li className="flex items-center">
                <Check size={16} className="mr-2" /> Better developer experience
              </li>
            </ul>
          </div>
          <button 
            onClick={onNewConversion}
            className="w-full py-3 bg-white text-indigo-600 rounded-md font-semibold hover:bg-opacity-90 transition-colors mt-4"
          >
            Start Free Conversion
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;