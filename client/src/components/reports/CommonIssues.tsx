import type { FC } from 'react';
import { issuesData } from '../../data/analyticsData';

const CommonIssues: FC = () => {
  return (
    <div>
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Common Conversion Issues</h2>
          <p className="text-sm text-gray-500">Frequently encountered issues during PHP to Node.js migrations</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Type</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {issuesData.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{issue.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{issue.frequency} instances</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${issue.impact === 'High' 
                          ? 'bg-red-100 text-red-800' 
                          : issue.impact === 'Medium' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}
                    >
                      {issue.impact}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {issue.projects} projects
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {issue.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resolutions & Recommendations</h2>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-md font-medium text-gray-800 mb-2">Database Connection Issues</h3>
            <p className="text-sm text-gray-600 mb-2">Problems with database connection strings, authentication, and connection pooling.</p>
            <div className="bg-indigo-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-indigo-800 mb-1">Recommendation:</h4>
              <p className="text-sm text-indigo-600">Use environment variables for database credentials and implement connection pooling with Sequelize ORM.</p>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-md font-medium text-gray-800 mb-2">Authentication Flow</h3>
            <p className="text-sm text-gray-600 mb-2">Session-based authentication in PHP needs to be converted to JWT token-based auth in Node.js.</p>
            <div className="bg-indigo-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-indigo-800 mb-1">Recommendation:</h4>
              <p className="text-sm text-indigo-600">Implement JWT strategy for authentication. Store refresh tokens in secure HTTP-only cookies.</p>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-md font-medium text-gray-800 mb-2">File Upload Handling</h3>
            <p className="text-sm text-gray-600 mb-2">PHP file upload mechanisms need to be replaced with Node.js equivalents.</p>
            <div className="bg-indigo-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-indigo-800 mb-1">Recommendation:</h4>
              <p className="text-sm text-indigo-600">Use Multer middleware for handling multipart/form-data and implement proper validation and file type checking.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonIssues;