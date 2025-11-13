import React from 'react';
import { 
  Layers, 
  TrendingUp, 
  Target, 
  AlertCircle,
  CheckCircle2,
  ArrowRight 
} from 'lucide-react';
import type { ArchitecturalInsights } from '../../../../types/analysis.types';

interface ArchitectureTabProps {
  insights: ArchitecturalInsights | string;
}

const ArchitectureTab: React.FC<ArchitectureTabProps> = ({ insights }) => {
  const parseInsights = () => {
    try {
      if (typeof insights === 'string') {
        return JSON.parse(insights);
      }
      return insights;
    } catch (error) {
      console.error('Failed to parse architectural insights:', error);
      return null;
    }
  };

  const parsedInsights = parseInsights();

  if (!parsedInsights) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No architectural insights available</h3>
        <p className="text-gray-600">Unable to load architectural analysis data</p>
      </div>
    );
  }

  const getComplexityColor = (complexity: string) => {
    const lower = complexity.toLowerCase();
    if (lower === 'low') return 'text-green-700 bg-green-100 border-green-200';
    if (lower === 'medium') return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    if (lower === 'high') return 'text-red-700 bg-red-100 border-red-200';
    return 'text-gray-700 bg-gray-100 border-gray-200';
  };

  const parseScore = (score: string) => {
    const match = score.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : null;
  };

  const maintainabilityScore = parseScore(parsedInsights.maintainability_score);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
              Pattern
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Architecture</h3>
          <p className="text-sm text-gray-600">{parsedInsights.architectural_pattern}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
              Score
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Maintainability</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600">
              {maintainabilityScore || 'N/A'}
            </span>
            <span className="text-sm text-gray-600">{maintainabilityScore ? '/ 10' : ''}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-orange-600" />
            <span className={`text-xs font-medium px-2 py-1 rounded ${getComplexityColor(parsedInsights.migration_to_nodejs_complexity)}`}>
              {parsedInsights.migration_to_nodejs_complexity}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Migration</h3>
          <p className="text-sm text-gray-600">Complexity Level</p>
        </div>
      </div>

      {/* Separation of Concerns */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Separation of Concerns
        </h2>
        <p className="text-gray-700 leading-relaxed">{parsedInsights.separation_of_concerns}</p>
      </div>

      {/* Scalability Considerations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Scalability Considerations
        </h2>
        <p className="text-gray-700 leading-relaxed">{parsedInsights.scalability_considerations}</p>
      </div>

      {/* Technical Debt */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          Technical Debt Indicators
        </h2>
        <p className="text-gray-700 leading-relaxed">{parsedInsights.technical_debt_indicators}</p>
      </div>

      {/* Recommended Architecture */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          Recommended Node.js Architecture
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">{parsedInsights.recommended_nodejs_architecture}</p>
        
        {maintainabilityScore && (
          <div className="mt-4 p-4 bg-white/60 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Current Maintainability</span>
              <span className="text-sm font-semibold text-gray-900">{maintainabilityScore} / 10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  maintainabilityScore >= 7 ? 'bg-green-500' :
                  maintainabilityScore >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(maintainabilityScore / 10) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Migration Strategy */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-600" />
          Step-by-Step Migration Strategy
        </h2>
        <div className="space-y-3">
          {parsedInsights.step_by_step_migration_strategy.map((step: string, index: number) => {
            // Remove the numbering from the step if it exists
            const cleanStep = step.replace(/^\d+\.\s*/, '');
            
            return (
              <div
                key={index}
                className="flex items-start gap-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800">{cleanStep}</p>
                </div>
                {index < parsedInsights.step_by_step_migration_strategy.length - 1 && (
                  <ArrowRight className="flex-shrink-0 w-5 h-5 text-gray-400 mt-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">Architecture Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-300 text-sm mb-1">Current Pattern</p>
            <p className="font-semibold">{parsedInsights.architectural_pattern}</p>
          </div>
          <div>
            <p className="text-gray-300 text-sm mb-1">Recommended for Node.js</p>
            <p className="font-semibold">Express.js with Microservices</p>
          </div>
          <div>
            <p className="text-gray-300 text-sm mb-1">Maintainability Score</p>
            <p className="font-semibold">{parsedInsights.maintainability_score}</p>
          </div>
          <div>
            <p className="text-gray-300 text-sm mb-1">Migration Complexity</p>
            <p className="font-semibold">{parsedInsights.migration_to_nodejs_complexity}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureTab;