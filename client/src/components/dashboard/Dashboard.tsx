// src/components/dashboard/Dashboard.tsx
import type { FC } from 'react';
import { 
  ChevronRight, 
  FileText, 
  Code, 
  Activity, 
  Server, 
  Check,
  ArrowRight,
  Edit
} from 'lucide-react';

interface DashboardProps {
  onNewConversion: () => void;
}

const Dashboard: FC<DashboardProps> = ({ onNewConversion }) => {
  // Sample projects for the "Recent Projects" section
  const recentProjects = [
    { 
      id: 1, 
      name: 'E-commerce API', 
      date: 'Oct 12, 2025', 
      status: 'Completed',
      files: 32,
      loc: 4572,
      coverage: 98
    },
    { 
      id: 2, 
      name: 'CRM System', 
      date: 'Oct 10, 2025', 
      status: 'In Progress',
      files: 47,
      loc: 7823,
      coverage: 85
    },
    { 
      id: 3, 
      name: 'Blog Platform', 
      date: 'Oct 8, 2025', 
      status: 'Completed',
      files: 18,
      loc: 2156,
      coverage: 100
    }
  ];

  // Testimonials
  // const testimonials = [
  //   {
  //     quote: "We modernized our entire e-commerce backend in just two weeks with this tool. What would have taken months was accomplished in days.",
  //     author: "Sarah Chen",
  //     position: "CTO at ShopWave",
  //     company: "ShopWave",
  //     avatar: "https://ui-avatars.com/api/?name=Sarah+Chen&background=6366f1&color=fff"
  //   },
  //   {
  //     quote: "The code quality is impressive. We were able to convert our PHP monolith to a scalable microservices architecture with minimal manual intervention.",
  //     author: "Michael Rodriguez",
  //     position: "Lead Developer",
  //     company: "FinTech Solutions",
  //     avatar: "https://ui-avatars.com/api/?name=Michael+Rodriguez&background=10b981&color=fff"
  //   },
  //   {
  //     quote: "This tool saved us thousands of development hours. The AI-powered code suggestions are like having an expert Node.js developer on your team.",
  //     author: "Priya Sharma",
  //     position: "Engineering Manager",
  //     company: "CloudScale",
  //     avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=f59e0b&color=fff"
  //   }
  // ];

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
      
      {/* Key Benefits Section */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="5x Faster Development"
          value="80%"
          change="Time Saved"
          positive={true}
          description="compared to manual conversion"
          icon={<Zap className="text-indigo-500" />}
        />
        <StatCard
          title="High Quality Code"
          value="95%"
          change="Accuracy"
          positive={true}
          description="with minimal manual edits needed"
          icon={<Code className="text-emerald-500" />}
        />
        <StatCard
          title="Enterprise Ready"
          value="100%"
          change="Compliant"
          positive={true}
          description="with modern security standards"
          icon={<Shield className="text-blue-500" />}
        />
      </div> */}
      
      {/* Feature Highlights */}
      {/* <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Why Choose Our PHP to Node.js Converter?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="p-6">
            <div className="space-y-5">
              <div className="flex items-start">
                <div className="mt-1 bg-indigo-100 rounded-full p-1.5 text-indigo-600">
                  <Check size={16} />
                </div>
                <div className="ml-4">
                  <h3 className="text-md font-semibold">AI-Powered Code Analysis</h3>
                  <p className="text-gray-600 text-sm">Deep analysis of your codebase to identify patterns, dependencies, and optimal conversion strategies.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 bg-indigo-100 rounded-full p-1.5 text-indigo-600">
                  <Check size={16} />
                </div>
                <div className="ml-4">
                  <h3 className="text-md font-semibold">Framework-Aware Transformations</h3>
                  <p className="text-gray-600 text-sm">Specialized handling for popular frameworks like Laravel, Symfony, and CodeIgniter to their Node.js equivalents.</p>
                </div>
              </div> */}
              {/* <div className="flex items-start">
                <div className="mt-1 bg-indigo-100 rounded-full p-1.5 text-indigo-600">
                  <Check size={16} />
                </div>
                <div className="ml-4">
                  <h3 className="text-md font-semibold">Interactive Code Editor</h3>
                  <p className="text-gray-600 text-sm">Built-in editor with syntax highlighting allows you to refine the converted code to your exact specifications.</p>
                </div>
              </div> */}
            {/* </div>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              <div className="flex items-start">
                <div className="mt-1 bg-indigo-100 rounded-full p-1.5 text-indigo-600">
                  <Check size={16} />
                </div>
                <div className="ml-4">
                  <h3 className="text-md font-semibold">TypeScript Support</h3>
                  <p className="text-gray-600 text-sm">Option to convert directly to TypeScript with automatically inferred types for stronger code quality.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 bg-indigo-100 rounded-full p-1.5 text-indigo-600">
                  <Check size={16} />
                </div>
                <div className="ml-4">
                  <h3 className="text-md font-semibold">Multiple Export Options</h3>
                  <p className="text-gray-600 text-sm">Export your converted project as a ZIP, push to GitHub, or deploy directly to cloud providers.</p>
                </div>
              </div> */}
              {/* <div className="flex items-start">
                <div className="mt-1 bg-indigo-100 rounded-full p-1.5 text-indigo-600">
                  <Check size={16} />
                </div>
                <div className="ml-4">
                  <h3 className="text-md font-semibold">Docker & CI/CD Integration</h3>
                  <p className="text-gray-600 text-sm">Automatically generate Docker configurations and CI/CD pipelines for your converted applications.</p>
                </div>
              </div> */}
            {/* </div>
          </div>
        </div>
      </div> */}
      
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
      
      {/* Testimonials Slider
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">What Our Users Say</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-5">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img src={testimonial.avatar} alt={testimonial.author} className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.position}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}
      
      {/* Recent Projects with CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </div>
          <div className="p-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Files</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{project.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${project.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : project.status === 'In Progress' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.files}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
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