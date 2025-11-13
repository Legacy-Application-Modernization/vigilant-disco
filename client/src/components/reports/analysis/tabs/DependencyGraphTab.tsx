import React, { useState, useMemo } from 'react';
import { GitBranch, Search, ArrowRight } from 'lucide-react';
import type { DependencyGraph } from '../../../../types/analysis.types';

interface DependencyGraphTabProps {
  dependencyGraph: DependencyGraph;
}

const DependencyGraphTab: React.FC<DependencyGraphTabProps> = ({ dependencyGraph }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const graphStats = useMemo(() => {
    const files = Object.keys(dependencyGraph);
    const totalDependencies = Object.values(dependencyGraph).flat().filter(d => d && d.length > 0).length;
    const filesWithDeps = files.filter(f => dependencyGraph[f].length > 0).length;
    const avgDependencies = filesWithDeps > 0 ? (totalDependencies / filesWithDeps).toFixed(1) : '0';
    
    const mostDependent = files.reduce((max, file) => {
      return dependencyGraph[file].length > (dependencyGraph[max]?.length || 0) ? file : max;
    }, files[0]);

    return {
      totalFiles: files.length,
      totalDependencies,
      filesWithDeps,
      avgDependencies,
      mostDependent,
      mostDependentCount: dependencyGraph[mostDependent]?.length || 0
    };
  }, [dependencyGraph]);

  const filteredFiles = useMemo(() => {
    const files = Object.keys(dependencyGraph);
    if (!searchTerm) return files;
    return files.filter(file => 
      file.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dependencyGraph, searchTerm]);

  // helper removed (unused)

  const getDependencyLevel = (count: number) => {
    if (count === 0) return { color: 'bg-gray-100 text-gray-700', label: 'No dependencies' };
    if (count <= 3) return { color: 'bg-green-100 text-green-700', label: 'Low coupling' };
    if (count <= 6) return { color: 'bg-yellow-100 text-yellow-700', label: 'Medium coupling' };
    return { color: 'bg-red-100 text-red-700', label: 'High coupling' };
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="text-sm text-gray-600 mb-1">Total Files</div>
          <div className="text-3xl font-bold text-gray-900">{graphStats.totalFiles}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="text-sm text-gray-600 mb-1">Total Dependencies</div>
          <div className="text-3xl font-bold text-blue-600">{graphStats.totalDependencies}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="text-sm text-gray-600 mb-1">Files with Deps</div>
          <div className="text-3xl font-bold text-purple-600">{graphStats.filesWithDeps}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="text-sm text-gray-600 mb-1">Avg Dependencies</div>
          <div className="text-3xl font-bold text-orange-600">{graphStats.avgDependencies}</div>
        </div>
      </div>

      {/* Most Dependent File Highlight */}
      {graphStats.mostDependentCount > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-red-600" />
            Highest Coupling Alert
          </h3>
          <p className="text-gray-700 mb-2">
            <span className="font-mono bg-white px-2 py-1 rounded">{graphStats.mostDependent}</span>
            {' '}has the most dependencies with <span className="font-bold">{graphStats.mostDependentCount}</span> connections.
          </p>
          <p className="text-sm text-gray-600">
            Consider refactoring this file to reduce coupling and improve maintainability.
          </p>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Dependency List */}
      <div className="space-y-3">
        {filteredFiles.map((file) => {
          const dependencies = dependencyGraph[file] || [];
          const validDeps = dependencies.filter(d => d && d.length > 0);
          const level = getDependencyLevel(validDeps.length);
          const isSelected = selectedFile === file;

          return (
            <div
              key={file}
              className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200'
              }`}
            >
              <button
                onClick={() => setSelectedFile(isSelected ? null : file)}
                className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <GitBranch className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <h3 className="font-mono text-sm text-gray-900 break-all">
                        {file}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${level.color}`}>
                        {validDeps.length} {validDeps.length === 1 ? 'dependency' : 'dependencies'}
                      </span>
                      <span className="text-xs text-gray-500">{level.label}</span>
                    </div>
                  </div>
                </div>
              </button>

              {isSelected && validDeps.length > 0 && (
                <div className="border-t border-gray-200 p-5 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Dependencies ({validDeps.length})
                  </h4>
                  <div className="space-y-2">
                    {validDeps.map((dep, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200"
                      >
                        <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-mono text-sm text-gray-700 break-all">
                          {dep}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredFiles.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Dependency Matrix Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Coupling Analysis</h3>
        <div className="space-y-3">
          {Object.entries(dependencyGraph)
            .filter(([_, deps]) => deps.length > 0)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 10)
            .map(([file, deps]) => {
              const validDeps = deps.filter(d => d && d.length > 0);
              const percentage = (validDeps.length / graphStats.totalFiles) * 100;
              
              return (
                <div key={file} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono text-gray-700 truncate max-w-md">
                      {file}
                    </span>
                    <span className="text-gray-600 font-medium">
                      {validDeps.length} deps
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        validDeps.length <= 3 ? 'bg-green-500' :
                        validDeps.length <= 6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(percentage * 2, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default DependencyGraphTab;