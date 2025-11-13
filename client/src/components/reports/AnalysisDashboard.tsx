import React, { useState, useMemo } from 'react';
import { 
  FileCode, 
  GitBranch, 
  AlertTriangle, 
  
  Layers,
  BarChart3,
  ListChecks,
  Code2
} from 'lucide-react';
import type { AnalysisData } from '../../types/analysis.types';
import OverviewTab from './analysis/tabs/OverviewTab';
import FilesTab from './analysis/tabs/FilesTab';
import DependencyGraphTab from './analysis/tabs/DependencyGraphTab';
import MigrationPhasesTab from './analysis/tabs/MigrationPhasesTab';
import RisksTab from './analysis/tabs/RisksTab';
import ArchitectureTab from './analysis/tabs/ArchitectureTab';

interface AnalysisDashboardProps {
  analysisData: AnalysisData;
  projectName: string;
}

type TabType = 'overview' | 'files' | 'dependencies' | 'migration' | 'risks' | 'architecture';

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ 
  analysisData, 
  projectName 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const stats = useMemo(() => {
    const totalFiles = analysisData.files_summary.length;
    const totalDependencies = Object.values(analysisData.dependency_graph)
      .flat()
      .filter(dep => dep && dep.length > 0).length;
    
    const totalHours = analysisData.migration_phases.reduce((sum, phase) => {
      const hours = parseInt(phase.estimated_time.split(' ')[0]) || 0;
      return sum + hours;
    }, 0);

    const estimatedMigrationTime = `${totalHours} hours`;

    const complexityLevel = (analysisData.architectural_insights?.migration_to_nodejs_complexity ?? 'Medium') as 'Medium' | 'Low' | 'High';
    
    return {
      totalFiles,
      totalDependencies,
      estimatedMigrationTime,
      complexityLevel,
      riskCount: analysisData.top_risks.length
    };
  }, [analysisData]);

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: BarChart3 },
    { id: 'files' as TabType, label: 'Files Analysis', icon: FileCode },
    { id: 'dependencies' as TabType, label: 'Dependencies', icon: GitBranch },
    { id: 'migration' as TabType, label: 'Migration Plan', icon: ListChecks },
    { id: 'risks' as TabType, label: 'Risks', icon: AlertTriangle },
    { id: 'architecture' as TabType, label: 'Architecture', icon: Layers },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab analysisData={analysisData} stats={stats} />;
      case 'files':
        return <FilesTab files={analysisData.files_summary} />;
      case 'dependencies':
        return <DependencyGraphTab dependencyGraph={analysisData.dependency_graph} />;
      case 'migration':
        return <MigrationPhasesTab phases={analysisData.migration_phases} />;
      case 'risks':
        return <RisksTab risks={analysisData.top_risks} phases={analysisData.migration_phases} />;
      case 'architecture':
        return <ArchitectureTab insights={analysisData.architectural_insights} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Code2 className="w-8 h-8 text-blue-600" />
                  {projectName}
                </h1>
                <p className="text-gray-600 mt-1">PHP to Node.js Migration Analysis</p>
              </div>
              
              {/* Quick Stats */}
              <div className="hidden md:flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalFiles}</div>
                  <div className="text-sm text-gray-600">Files</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalDependencies}</div>
                  <div className="text-sm text-gray-600">Dependencies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.riskCount}</div>
                  <div className="text-sm text-gray-600">Risks</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AnalysisDashboard;