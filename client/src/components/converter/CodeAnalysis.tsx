import type { FC } from 'react';
import { FileText, Link, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AnalysisResult } from '../../types/conversion';

interface CodeAnalysisProps {
  results: AnalysisResult | null;
  onStartTransformation: () => void;
}

const CodeAnalysis: FC<CodeAnalysisProps> = ({ results, onStartTransformation }) => {
  if (!results) return <div className="p-8">Loading analysis results...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Code Analysis Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Code Metrics */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-2 rounded-md text-indigo-600 mr-2">
              <FileText size={20} />
            </div>
            <h3 className="text-lg font-semibold text-indigo-500">Code Metrics</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Lines of Code</span>
              <span className="font-semibold">{results.metrics.totalLinesOfCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Classes Detected</span>
              <span className="font-semibold">{results.metrics.classesDetected}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Functions</span>
              <span className="font-semibold">{results.metrics.functions}</span>
            </div>
            {/* <div className="flex justify-between">
              <span className="text-gray-500">Complexity Score</span>
              <span className="font-semibold text-emerald-500">{results.metrics.complexityScore}</span>
            </div> */}
          </div>
        </div>
        
        {/* Framework Detection */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-2 rounded-md text-indigo-600 mr-2">
              <Link size={20} />
            </div>
            <h3 className="text-lg font-semibold text-indigo-500">Framework Detection</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Framework</span>
              <span className="font-semibold">{results.framework.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Design Pattern</span>
              <span className="font-semibold">{results.framework.designPattern}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Database</span>
              <span className="font-semibold">{results.framework.database}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">API Type</span>
              <span className="font-semibold">{results.framework.apiType}</span>
            </div>
          </div>
        </div>
        
        {/* Dependencies */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-2 rounded-md text-indigo-600 mr-2">
              <Package size={20} />
            </div>
            <h3 className="text-lg font-semibold text-indigo-500">Dependencies</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">External Libraries</span>
              <span className="font-semibold">{results.dependencies.externalLibraries}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Composer Packages</span>
              <span className="font-semibold">{results.dependencies.composerPackages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Node.js Equivalents</span>
              <span className="font-semibold text-emerald-500">{results.dependencies.nodejsEquivalents}</span>
            </div>
            {/* <div className="flex justify-between">
              <span className="text-gray-500">Migration Difficulty</span>
              <span className="font-semibold text-amber-500">{results.dependencies.migrationDifficulty}</span>
            </div> */}
          </div>
        </div>
      </div>
      
      <div className="text-center text-gray-500 mb-8">
        Analyzing code patterns and generating transformation strategy...
      </div>
      
      <div className="flex justify-between">
        <button className="text-indigo-500 px-6 py-2 rounded-md hover:bg-indigo-50 transition-colors flex items-center">
          <ChevronLeft size={18} className="mr-1" /> Back
        </button>
        
        <button 
          onClick={onStartTransformation}
          className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 transition-colors flex items-center"
        >
          Start Transformation <ChevronRight size={18} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default CodeAnalysis;