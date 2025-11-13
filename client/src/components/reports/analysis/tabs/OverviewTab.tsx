import React from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Package,
  FileCode,
  GitBranch,
  Layers
} from 'lucide-react';
import type { AnalysisData, AnalysisStats } from '../../../../types/analysis.types';

interface OverviewTabProps {
  analysisData: AnalysisData;
  stats: AnalysisStats;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ analysisData, stats }) => {
  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const parseArchitecturalInsights = () => {
    try {
      if (typeof analysisData.architectural_insights === 'string') {
        return JSON.parse(analysisData.architectural_insights);
      }
      return analysisData.architectural_insights;
    } catch {
      return analysisData.architectural_insights;
    }
  };

  const insights = parseArchitecturalInsights();

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalFiles}</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <FileCode className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dependencies</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDependencies}</p>
            </div>
            <div className="bg-purple-100 rounded-lg p-3">
              <GitBranch className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Est. Time</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.estimatedMigrationTime}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Complexity</p>
              <p className={`text-2xl font-bold mt-2 ${getComplexityColor(stats.complexityLevel).split(' ')[0]}`}>
                {stats.complexityLevel}
              </p>
            </div>
            <div className={`rounded-lg p-3 ${getComplexityColor(stats.complexityLevel).split(' ')[1]}`}>
              <TrendingUp className={`w-6 h-6 ${getComplexityColor(stats.complexityLevel).split(' ')[0]}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Framework Detection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-blue-600" />
          Framework Analysis
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">Detected Framework</p>
            <p className="text-lg font-semibold text-gray-900">
              {analysisData.framework_analysis.framework || 'Unknown'}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">Confidence Score</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${analysisData.framework_analysis.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {(analysisData.framework_analysis.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Understanding */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-blue-600" />
          Project Understanding
        </h2>
        <div className="prose prose-sm max-w-none text-gray-700">
          <p className="whitespace-pre-wrap">{analysisData.code_understanding}</p>
        </div>
      </div>

      {/* Key Architecture Insights */}
      {insights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Architecture Pattern</h3>
            <p className="text-gray-700">{insights.architectural_pattern}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Maintainability Score</h3>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-blue-600">
                {insights.maintainability_score?.split('(')[0]?.trim() || 'N/A'}
              </div>
              <span className="text-gray-600">out of 10</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Separation of Concerns</h3>
            <p className="text-gray-700">{insights.separation_of_concerns}</p>
          </div>
        </div>
      )}

      {/* Top Risks Summary */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Top Migration Risks
        </h2>
        <div className="space-y-2">
          {analysisData.top_risks.slice(0, 3).map((risk, index) => (
            <div key={index} className="flex items-start gap-3 bg-white/60 rounded-lg p-3">
              <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm mt-0.5">
                {index + 1}
              </div>
              <p className="text-gray-700 text-sm">{risk}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Migration Phases Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Migration Phases Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysisData.migration_phases.slice(0, 3).map((phase) => (
            <div key={phase.number} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-600 font-semibold px-2 py-1 rounded text-sm">
                  Phase {phase.number}
                </span>
                <span className="text-gray-500 text-sm">{phase.estimated_time}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{phase.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{phase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;