import type { FC } from 'react';
import { apiKeys } from '../../data/userData';

const ApiKeys: FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">API Keys</h3>
        <p className="text-sm text-gray-500">
          Manage your API keys for programmatic access to the PHP to Node.js conversion service.
        </p>
      </div>
      
      {apiKeys.map((apiKey) => (
        <div key={apiKey.id} className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
              <p className="text-xs text-gray-500 mt-1">
                Use this key for {apiKey.type === 'live' ? 'production' : 'testing'} environments
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                Regenerate
              </button>
              <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                Revoke
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="text"
              className="block w-full border-gray-300 bg-gray-100 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={apiKey.key}
              readOnly
            />
            <button className="ml-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Copy
            </button>
          </div>
        </div>
      ))}
      
      <div className="bg-indigo-50 p-4 rounded-md">
        <h4 className="font-medium text-indigo-800 mb-2">API Documentation</h4>
        <p className="text-sm text-indigo-600 mb-4">
          Check out our API documentation to learn how to integrate PHP to Node.js conversion into your workflow.
        </p>
        <button className="px-4 py-2 border border-indigo-500 rounded-md text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50">
          View Documentation
        </button>
      </div>
    </div>
  );
};

export default ApiKeys;