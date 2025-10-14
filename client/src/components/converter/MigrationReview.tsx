import type { FC } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';
import type { TransformationSummary } from '../../types/conversion';

interface MigrationReviewProps {
  summary: TransformationSummary;
  onExportProject: () => void;
}

const MigrationReview: FC<MigrationReviewProps> = ({ summary, onExportProject }) => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Migration Review</h2>
      
      {/* Transformation Summary */}
      <div className="bg-indigo-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold mb-4">Transformation Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-4xl font-bold text-indigo-500 mb-2">{summary.filesConverted}</div>
            <div className="text-gray-500">Files Converted</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-4xl font-bold text-indigo-500 mb-2">{summary.linesOfCode}</div>
            <div className="text-gray-500">Lines of Code</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-4xl font-bold text-indigo-500 mb-2">{summary.coverage}%</div>
            <div className="text-gray-500">Coverage</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-4xl font-bold text-emerald-500 mb-2">{summary.errors}</div>
            <div className="text-gray-500">Errors</div>
          </div>
        </div>
      </div>
      
      {/* Migration Confidence */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Migration Confidence</span>
          <span className="text-emerald-500 font-medium">High</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-indigo-500 h-2.5 rounded-full"
            style={{ width: `${summary.confidence}%` }}
          ></div>
        </div>
        <div className="text-right text-sm text-gray-500 mt-1">{summary.confidence}%</div>
      </div>
      
      {/* Key Changes Applied */}
      <div className="mb-8">
        <h3 className="font-semibold mb-4">Key Changes Applied:</h3>
        <ul className="space-y-2">
          <li className="flex items-center">
            <CheckCircle size={16} className="text-emerald-500 mr-2" />
            <span>Converted Laravel controllers to Express.js middleware</span>
          </li>
          <li className="flex items-center">
            <CheckCircle size={16} className="text-emerald-500 mr-2" />
            <span>Replaced Eloquent ORM with Sequelize</span>
          </li>
          <li className="flex items-center">
            <CheckCircle size={16} className="text-emerald-500 mr-2" />
            <span>Transformed blade templates to EJS/Handlebars</span>
          </li>
          <li className="flex items-center">
            <CheckCircle size={16} className="text-emerald-500 mr-2" />
            <span>Migrated routing from Laravel to Express routes</span>
          </li>
          <li className="flex items-center">
            <CheckCircle size={16} className="text-emerald-500 mr-2" />
            <span>Converted validation rules to custom validator</span>
          </li>
          <li className="flex items-center">
            <CheckCircle size={16} className="text-emerald-500 mr-2" />
            <span>Added comprehensive error handling</span>
          </li>
          <li className="flex items-center">
            <CheckCircle size={16} className="text-emerald-500 mr-2" />
            <span>Generated package.json with all dependencies</span>
          </li>
        </ul>
      </div>
      
      {/* Manual Review Recommended */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md mb-8">
        <div className="flex">
          <AlertTriangle size={20} className="text-amber-400 mr-2 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-amber-800">Manual Review Recommended:</h4>
            <ul className="ml-6 mt-2 space-y-1 list-disc text-amber-800">
              <li>Database connection strings need to be updated</li>
              <li>Environment variables should be configured</li>
              <li>Custom middleware may need adjustment</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button className="text-indigo-500 px-6 py-2 rounded-md hover:bg-indigo-50 transition-colors flex items-center">
          <ChevronLeft size={18} className="mr-1" /> Back to Edit
        </button>
        
        <button 
          onClick={onExportProject}
          className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 transition-colors flex items-center"
        >
          Export Project <ChevronRight size={18} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default MigrationReview;