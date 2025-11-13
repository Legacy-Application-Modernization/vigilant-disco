import React, { useState } from 'react';
import {
  ArrowLeft,
  FileCode,
  GitBranch,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Shield,
  Package,
  Code,
  FileText,
  Network
} from 'lucide-react';

// Adapted for tab-based navigation (no React Router)

interface ReportsProps {
  analysisResult?: any;
  conversionPlanner?: any;
  onBack?: () => void;
}

type TabType = 'overview' | 'architecture' | 'dependencies' | 'files' | 'migration-plan' | 'risks';

const Reports: React.FC<ReportsProps> = ({ 
  analysisResult, 
  conversionPlanner, 
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // If no data provided, show message
  if (!analysisResult || !conversionPlanner) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Data Available</h3>
          <p className="text-gray-600">
            Please complete the code analysis first to view detailed reports.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Project Overview', icon: FileCode },
    { id: 'architecture' as TabType, label: 'Architecture', icon: Layers },
    { id: 'dependencies' as TabType, label: 'Dependencies', icon: Network },
    { id: 'files' as TabType, label: 'File Analysis', icon: FileText },
    { id: 'migration-plan' as TabType, label: 'Migration Plan', icon: GitBranch },
    { id: 'risks' as TabType, label: 'Risks & Strategy', icon: AlertTriangle }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Project Understanding */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          Project Understanding
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Purpose</label>
            <p className="text-gray-900 mt-1">{analysisResult.project_understanding.project_purpose}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Target Users</label>
            <p className="text-gray-900 mt-1">{analysisResult.project_understanding.target_users}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Main Features</label>
            <ul className="mt-2 space-y-1">
              {analysisResult.project_understanding.main_features.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-gray-900">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Technology Stack</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {analysisResult.project_understanding.technology_stack.map((tech: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Business Logic Overview</label>
            <p className="text-gray-900 mt-1">{analysisResult.project_understanding.business_logic_overview}</p>
          </div>

          {analysisResult.project_understanding.notable_observations && (
            <div>
              <label className="text-sm font-medium text-gray-600">Notable Observations</label>
              <p className="text-gray-900 mt-1">{analysisResult.project_understanding.notable_observations}</p>
            </div>
          )}
        </div>
      </div>

      {/* Framework Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-purple-500" />
          Framework & Technology Details
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Framework</label>
            <p className="text-gray-900 mt-1">{analysisResult.framework_info.framework || 'Custom PHP'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Version</label>
            <p className="text-gray-900 mt-1">{analysisResult.framework_info.version || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Database</label>
            <p className="text-gray-900 mt-1">{analysisResult.framework_info.database || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">ORM</label>
            <p className="text-gray-900 mt-1">{analysisResult.framework_info.orm || 'None'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">API Type</label>
            <p className="text-gray-900 mt-1">{analysisResult.framework_info.api_type || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Authentication</label>
            <p className="text-gray-900 mt-1">{analysisResult.framework_info.authentication || 'None'}</p>
          </div>
        </div>

        {analysisResult.framework_info.design_patterns.length > 0 && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-600">Design Patterns</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {analysisResult.framework_info.design_patterns.map((pattern: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                  {pattern}
                </span>
              ))}
            </div>
          </div>
        )}

        {analysisResult.framework_info.libraries.length > 0 && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-600">Libraries</label>
            <div className="mt-2 space-y-2">
              {analysisResult.framework_info.libraries.map((lib: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Package className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{lib.name}</p>
                    <p className="text-sm text-gray-600">{lib.purpose}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderArchitecture = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-500" />
          Architectural Insights
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Architectural Pattern</label>
            <p className="text-gray-900 mt-1">{analysisResult.architectural_insights.architectural_pattern}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Separation of Concerns</label>
            <p className="text-gray-900 mt-1">{analysisResult.architectural_insights.separation_of_concerns}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Scalability Considerations</label>
            <p className="text-gray-900 mt-1">{analysisResult.architectural_insights.scalability_considerations}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Maintainability Notes</label>
            <p className="text-gray-900 mt-1">{analysisResult.architectural_insights.maintainability_notes}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Migration Complexity</label>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
              analysisResult.architectural_insights.migration_complexity === 'Low' 
                ? 'bg-green-100 text-green-700'
                : analysisResult.architectural_insights.migration_complexity === 'Medium'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {analysisResult.architectural_insights.migration_complexity}
            </span>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Recommended Node.js Architecture</label>
            <p className="text-gray-900 mt-1">{analysisResult.architectural_insights.recommended_nodejs_architecture}</p>
          </div>

          {analysisResult.architectural_insights.technical_debt.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-600">Technical Debt</label>
              <ul className="mt-2 space-y-1">
                {analysisResult.architectural_insights.technical_debt.map((debt: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-900">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{debt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysisResult.architectural_insights.risks_or_assumptions && (
            <div>
              <label className="text-sm font-medium text-gray-600">Risks & Assumptions</label>
              <p className="text-gray-900 mt-1">{analysisResult.architectural_insights.risks_or_assumptions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDependencies = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Network className="w-5 h-5 text-green-500" />
          Dependency Graph
        </h3>
        <div className="space-y-3">
          {Object.entries(analysisResult.dependency_graph).map(([file, deps]: [string, any]) => (
            <div key={file} className="border border-gray-200 rounded-lg p-4">
              <div className="font-medium text-gray-900 mb-2">{file}</div>
              {deps.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {deps.map((dep: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {dep}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No dependencies</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {analysisResult.circular_dependency.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Circular Dependencies Detected
          </h3>
          <ul className="space-y-2">
            {analysisResult.circular_dependency.map((dep: string, idx: number) => (
              <li key={idx} className="text-red-800">{dep}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderFiles = () => (
    <div className="space-y-4">
      {analysisResult.files_summary.map((file: any, idx: number) => (
        <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{file.file_path}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    file.file_type === 'CONTROLLER' 
                      ? 'bg-blue-100 text-blue-700'
                      : file.file_type === 'MODEL'
                      ? 'bg-purple-100 text-purple-700'
                      : file.file_type === 'SERVICE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {file.file_type}
                  </span>
                  <span className="text-xs text-gray-500">{file.responsibility_type}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase">Purpose</label>
              <p className="text-sm text-gray-900 mt-1">{file.file_purpose}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase">Primary Functionality</label>
              <p className="text-sm text-gray-900 mt-1">{file.primary_functionality}</p>
            </div>

            {file.dependencies.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-600 uppercase">Dependencies</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {file.dependencies.map((dep: string, depIdx: number) => (
                    <span key={depIdx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderMigrationPlan = () => (
    <div className="space-y-6">
      {conversionPlanner.phases.map((phase: any) => (
        <div key={phase.number} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">{phase.number}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{phase.name}</h3>
              <p className="text-gray-600 mt-1">{phase.description}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {phase.estimated_time}
              </div>
              <div className="text-xs text-gray-500 mt-1">{phase.file_count} files</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase mb-2 block">Files Included</label>
              <div className="space-y-1">
                {phase.files.map((file: string, idx: number) => (
                  <div key={idx} className="text-sm text-gray-900 flex items-center gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full" />
                    {file}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase mb-2 block">File Types</label>
              <div className="flex flex-wrap gap-2">
                {phase.file_types.map((type: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="text-xs font-medium text-gray-600 uppercase mb-2 block">Success Criteria</label>
            <p className="text-sm text-gray-900">{phase.success_criteria}</p>
          </div>

          {phase.risks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="text-xs font-medium text-gray-600 uppercase mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Risks
              </label>
              <ul className="space-y-1">
                {phase.risks.map((risk: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-900 flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="text-xs font-medium text-gray-600 uppercase mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Testing Strategy
            </label>
            <p className="text-sm text-gray-900">{phase.testing_strategy}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRisks = () => (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Top Migration Risks
        </h3>
        <ul className="space-y-3">
          {conversionPlanner.top_risks.map((risk: string, idx: number) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-900 font-bold text-sm">{idx + 1}</span>
              </div>
              <p className="text-red-900">{risk}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          Migration Strategy
        </h3>
        <p className="text-gray-900 leading-relaxed whitespace-pre-line">
          {conversionPlanner.migration_strategy}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-full">
      {/* Header */}
      {onBack && (
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analysis
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 mb-6 rounded-t-lg">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'architecture' && renderArchitecture()}
        {activeTab === 'dependencies' && renderDependencies()}
        {activeTab === 'files' && renderFiles()}
        {activeTab === 'migration-plan' && renderMigrationPlan()}
        {activeTab === 'risks' && renderRisks()}
      </div>
    </div>
  );
};

export default Reports;