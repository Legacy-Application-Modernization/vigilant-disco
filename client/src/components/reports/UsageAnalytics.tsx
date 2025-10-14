import type { FC } from 'react';

const UsageAnalytics: FC = () => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h2>
        <p className="text-sm text-gray-500 mb-4">
          This section provides detailed usage analytics including user activity patterns, 
          feature usage frequency, and resource utilization metrics.
        </p>
        
        {/* Placeholder content */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-600 mb-4">
            Detailed usage analytics will appear here, showing:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600">
            <li>• User activity patterns and frequency</li>
            <li>• Most used conversion options and features</li>
            <li>• Resource utilization (CPU/memory) during conversions</li>
            <li>• Session duration and engagement metrics</li>
            <li>• Feature adoption rates across user base</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UsageAnalytics;