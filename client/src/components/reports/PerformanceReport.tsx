import type { FC } from 'react';
import { Activity, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import StatCard from '../ui/StatCard';

const PerformanceReport: FC = () => {
  
  return (
    <div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Average Conversion Rate"
          value="94%"
          change="+2.5%"
          positive={true}
          description="from last month"
          icon={<Activity className="text-indigo-500" />}
        />
        <StatCard
          title="Time Saved"
          value="486 hrs"
          change="+12%"
          positive={true}
          description="from last month"
          icon={<Clock className="text-emerald-500" />}
        />
        <StatCard
          title="Code Quality Score"
          value="8.7/10"
          change="+0.4"
          positive={true}
          description="from last month"
          icon={<CheckCircle className="text-blue-500" />}
        />
        <StatCard
          title="Error Rate"
          value="5.3%"
          change="-2.1%"
          positive={true}
          description="from last month"
          icon={<AlertTriangle className="text-amber-500" />}
        />
      </div>
      
      {/* Conversion Success Rate Chart - Placeholder */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Conversion Success Rate</h2>
          <select className="text-sm border-gray-300 rounded-md">
            <option>This Year</option>
            <option>Last Year</option>
            <option>Last 6 Months</option>
          </select>
        </div>
        <div className="flex items-center justify-center h-[300px] bg-gray-50 border border-gray-100 rounded">
          <p className="text-gray-500">Chart placeholder - install recharts library</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Framework Distribution - Placeholder */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">PHP Framework Distribution</h2>
          <div className="flex items-center justify-center h-[250px] bg-gray-50 border border-gray-100 rounded">
            <p className="text-gray-500">Pie chart placeholder - install recharts library</p>
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Code Coverage</span>
                <span className="text-sm font-semibold">93%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '93%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Validation Accuracy</span>
                <span className="text-sm font-semibold">97%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '97%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Error Handling</span>
                <span className="text-sm font-semibold">89%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '89%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Code Optimization</span>
                <span className="text-sm font-semibold">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport;