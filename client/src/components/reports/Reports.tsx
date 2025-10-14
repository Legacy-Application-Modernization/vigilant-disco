import { useState } from 'react';
import type { FC } from 'react';
import { Download, Calendar } from 'lucide-react';
import PerformanceReport from './PerformanceReport';
import UsageAnalytics from './UsageAnalytics';
import CommonIssues from './CommonIssues';

type ReportTab = 'performance' | 'usage' | 'issues';

const Reports: FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('performance');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center">
            <Download className="h-4 w-4 mr-1" /> Export
          </button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center">
            <Calendar className="h-4 w-4 mr-1" /> Date Range
          </button>
        </div>
      </div>
      
      {/* Report Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'performance'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'usage'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('usage')}
          >
            Usage Analytics
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'issues'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('issues')}
          >
            Common Issues
          </button>
        </nav>
      </div>
      
      {activeTab === 'performance' && <PerformanceReport />}
      {activeTab === 'usage' && <UsageAnalytics />}
      {activeTab === 'issues' && <CommonIssues />}
    </div>
  );
};

export default Reports;