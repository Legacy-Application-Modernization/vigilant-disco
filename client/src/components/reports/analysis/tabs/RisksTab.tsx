import React, { useMemo } from 'react';
import { AlertTriangle, Shield, TrendingUp, Database, Code, Lock } from 'lucide-react';
import type { MigrationPhase } from '../../../../types/analysis.types';

interface RisksTabProps {
  risks: string[];
  phases: MigrationPhase[];
}

const RisksTab: React.FC<RisksTabProps> = ({ risks, phases }) => {
  const categorizedRisks = useMemo(() => {
    const categories = {
      data: [] as string[],
      performance: [] as string[],
      security: [] as string[],
      logic: [] as string[],
      other: [] as string[]
    };

    risks.forEach(risk => {
      const lowerRisk = risk.toLowerCase();
      if (lowerRisk.includes('data') || lowerRisk.includes('type') || lowerRisk.includes('corruption')) {
        categories.data.push(risk);
      } else if (lowerRisk.includes('performance') || lowerRisk.includes('query') || lowerRisk.includes('async')) {
        categories.performance.push(risk);
      } else if (lowerRisk.includes('security') || lowerRisk.includes('vulnerability') || lowerRisk.includes('authentication')) {
        categories.security.push(risk);
      } else if (lowerRisk.includes('logic') || lowerRisk.includes('error') || lowerRisk.includes('behavior')) {
        categories.logic.push(risk);
      } else {
        categories.other.push(risk);
      }
    });

    return categories;
  }, [risks]);

  const phaseRisks = useMemo(() => {
    const allPhaseRisks = phases.flatMap(phase => 
      phase.risks.map(risk => ({
        phase: phase.number,
        phaseName: phase.name,
        risk
      }))
    );
    return allPhaseRisks;
  }, [phases]);

  const getSeverityLevel = (category: string) => {
    switch (category) {
      case 'security':
        return { level: 'Critical', color: 'red', icon: Lock };
      case 'data':
        return { level: 'High', color: 'orange', icon: Database };
      case 'logic':
        return { level: 'High', color: 'yellow', icon: Code };
      case 'performance':
        return { level: 'Medium', color: 'blue', icon: TrendingUp };
      default:
        return { level: 'Low', color: 'gray', icon: Shield };
    }
  };

  const getCategoryColor = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="space-y-6">
      {/* Risk Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.keys(categorizedRisks).map((category) => {
          const riskList = categorizedRisks[category as keyof typeof categorizedRisks];
          const { level, color, icon: Icon } = getSeverityLevel(category);
          const colors = getCategoryColor(color);
          
          return (
            <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${colors.text}`} />
                <span className={`px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
                  {level}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{riskList.length}</div>
              <div className="text-sm text-gray-600 capitalize">{category} Risks</div>
            </div>
          );
        })}
      </div>

      {/* Risk Severity Alert */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="bg-red-100 rounded-lg p-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Migration Risk Assessment
            </h3>
            <p className="text-gray-700 mb-3">
              This migration has been identified with <span className="font-bold">{risks.length}</span> top-level risks 
              and <span className="font-bold">{phaseRisks.length}</span> phase-specific risks that require careful attention.
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg font-medium">
                {categorizedRisks.security.length} Security
              </span>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg font-medium">
                {categorizedRisks.data.length} Data
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg font-medium">
                {categorizedRisks.logic.length} Logic
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Categorized Risks */}
      <div className="space-y-6">
        {Object.entries(categorizedRisks).map(([category, riskList]) => {
          if (riskList.length === 0) return null;
          
          const { level, color, icon: Icon } = getSeverityLevel(category);
          const colors = getCategoryColor(color);
          
          return (
            <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`${colors.bg} rounded-lg p-2`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {category} Risks
                  </h3>
                  <p className="text-sm text-gray-600">
                    {level} severity · {riskList.length} {riskList.length === 1 ? 'risk' : 'risks'} identified
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {riskList.map((risk, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${colors.bg} rounded-lg p-4 border ${colors.border}`}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center ${colors.text} font-semibold text-sm`}>
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-800 flex-1">{risk}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Phase-Specific Risks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Phase-Specific Risks
        </h3>
        
        <div className="space-y-4">
          {phases.map((phase) => {
            if (phase.risks.length === 0) return null;
            
            return (
              <div key={phase.number} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded text-sm">
                    Phase {phase.number}
                  </span>
                  <h4 className="font-semibold text-gray-900">{phase.name}</h4>
                  <span className="text-sm text-gray-500">
                    {phase.risks.length} {phase.risks.length === 1 ? 'risk' : 'risks'}
                  </span>
                </div>
                
                <div className="space-y-2 pl-4">
                  {phase.risks.map((risk, riskIndex) => (
                    <div key={riskIndex} className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-1.5 h-1.5 bg-orange-400 rounded-full mt-2" />
                      <p className="text-sm text-gray-700">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mitigation Strategies */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          Recommended Mitigation Strategies
        </h3>
        
        <div className="space-y-3">
          <div className="bg-white/70 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-gray-900 mb-2">Comprehensive Testing</h4>
            <p className="text-sm text-gray-700">
              Implement unit, integration, and end-to-end tests for each migration phase. Use testing databases to avoid production data impact.
            </p>
          </div>
          
          <div className="bg-white/70 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-gray-900 mb-2">Incremental Migration</h4>
            <p className="text-sm text-gray-700">
              Follow the phased approach strictly. Complete and validate each phase before moving to the next to minimize risk accumulation.
            </p>
          </div>
          
          <div className="bg-white/70 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-gray-900 mb-2">Code Review & Validation</h4>
            <p className="text-sm text-gray-700">
              Conduct thorough code reviews after each phase. Validate converted code against original PHP behavior and document any intentional deviations.
            </p>
          </div>
          
          <div className="bg-white/70 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-gray-900 mb-2">Performance Monitoring</h4>
            <p className="text-sm text-gray-700">
              Set up monitoring for database queries and API response times. Compare Node.js performance against PHP baseline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RisksTab;