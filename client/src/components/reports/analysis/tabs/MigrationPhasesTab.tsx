import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileCode,
  ChevronDown,
  ChevronRight,
  Target,
  TestTube
} from 'lucide-react';
import type { MigrationPhase } from '../../../../types/analysis.types';

interface MigrationPhasesTabProps {
  phases: MigrationPhase[];
}

const MigrationPhasesTab: React.FC<MigrationPhasesTabProps> = ({ phases }) => {
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([1]));

  const togglePhase = (phaseNumber: number) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phaseNumber)) {
        newSet.delete(phaseNumber);
      } else {
        newSet.add(phaseNumber);
      }
      return newSet;
    });
  };

  const totalTime = phases.reduce((sum, phase) => {
    const hours = parseInt(phase.estimated_time.split(' ')[0]) || 0;
    return sum + hours;
  }, 0);

  const totalFiles = phases.reduce((sum, phase) => sum + phase.file_count, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Phases</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{phases.length}</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estimated Time</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalTime}h</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Files to Migrate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalFiles}</p>
            </div>
            <div className="bg-purple-100 rounded-lg p-3">
              <FileCode className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Migration Timeline</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {phases.map((phase, index) => {
            const hours = parseInt(phase.estimated_time.split(' ')[0]) || 0;
            const width = (hours / totalTime) * 100;
            
            return (
              <React.Fragment key={phase.number}>
                <div
                  className="relative group cursor-pointer"
                  style={{ minWidth: `${Math.max(width, 10)}%` }}
                  onClick={() => togglePhase(phase.number)}
                >
                  <div className={`h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                    expandedPhases.has(phase.number)
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}>
                    Phase {phase.number}
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {phase.estimated_time}
                  </div>
                </div>
                {index < phases.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Phase Details */}
      <div className="space-y-4">
        {phases.map((phase) => {
          const isExpanded = expandedPhases.has(phase.number);
          
          return (
            <div
              key={phase.number}
              className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                isExpanded ? 'border-blue-500 shadow-md' : 'border-gray-200'
              }`}
            >
              <button
                onClick={() => togglePhase(phase.number)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                      isExpanded ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {phase.number}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {phase.name}
                    </h3>
                    <p className="text-gray-600 mb-3">{phase.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{phase.estimated_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileCode className="w-4 h-4" />
                        <span>{phase.file_count} {phase.file_count === 1 ? 'file' : 'files'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{phase.risks.length} {phase.risks.length === 1 ? 'risk' : 'risks'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200">
                  <div className="p-6 space-y-6">
                    {/* Files to Migrate */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-blue-600" />
                        Files to Migrate
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {phase.files.map((file, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                          >
                            <div className="flex items-center gap-2">
                              <FileCode className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="font-mono text-sm text-gray-700 truncate">
                                {file}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* File Types */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        File Types
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {phase.file_types.map((type, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Risks */}
                    {phase.risks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                          Potential Risks
                        </h4>
                        <div className="space-y-2">
                          {phase.risks.map((risk, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 bg-orange-50 rounded-lg p-3 border border-orange-200"
                            >
                              <div className="flex-shrink-0 w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-xs mt-0.5">
                                {index + 1}
                              </div>
                              <p className="text-sm text-gray-700">{risk}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Success Criteria */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-600" />
                        Success Criteria
                      </h4>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="text-sm text-gray-700">{phase.success_criteria}</p>
                      </div>
                    </div>

                    {/* Testing Strategy */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <TestTube className="w-4 h-4 text-blue-600" />
                        Testing Strategy
                      </h4>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-gray-700">{phase.testing_strategy}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MigrationPhasesTab;