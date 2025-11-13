import React, { useState, useMemo } from 'react';
import { Search, FileCode, ChevronDown, ChevronUp } from 'lucide-react';
import type { FileSummary } from '../../../../types/analysis.types';

interface FilesTabProps {
  files: FileSummary[];
}

const FilesTab: React.FC<FilesTabProps> = ({ files }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set());

  const fileTypes = useMemo(() => {
    const types = new Set(files.map(f => f.file_type));
    return ['all', ...Array.from(types)];
  }, [files]);

  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesSearch = file.file_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.file_purpose.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || file.file_type === filterType;
      return matchesSearch && matchesType;
    });
  }, [files, searchTerm, filterType]);

  const toggleExpand = (index: number) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      CONTROLLER: 'bg-blue-100 text-blue-700',
      MODEL: 'bg-green-100 text-green-700',
      SERVICE: 'bg-purple-100 text-purple-700',
      HELPER: 'bg-orange-100 text-orange-700',
      REPOSITORY: 'bg-pink-100 text-pink-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const formatFunctionality = (functionality: string | string[]) => {
    if (Array.isArray(functionality)) {
      return functionality.join(' ');
    }
    return functionality;
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Files Analysis</h2>
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredFiles.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{files.length}</span> files
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search files by path or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {fileTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Files List */}
      <div className="space-y-3">
        {filteredFiles.map((file, index) => {
          const isExpanded = expandedFiles.has(index);
          
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleExpand(index)}
                className="w-full p-5 flex items-start gap-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  <FileCode className="w-5 h-5 text-gray-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {file.file_path}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(file.file_type)}`}>
                      {file.file_type}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {file.file_purpose}
                  </p>
                  
                  {file.dependencies.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium">{file.dependencies.length} dependencies</span>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 p-5 bg-gray-50">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Primary Functionality</h4>
                      <p className="text-sm text-gray-600">
                        {formatFunctionality(file.primary_functionality)}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Responsibility Type</h4>
                      <p className="text-sm text-gray-600">
                        {Array.isArray(file.responsibility_type) 
                          ? file.responsibility_type.join(', ') 
                          : file.responsibility_type}
                      </p>
                    </div>

                    {file.dependencies.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Dependencies ({file.dependencies.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {file.dependencies.map((dep, depIndex) => (
                            <span
                              key={depIndex}
                              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600 font-mono"
                            >
                              {dep}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredFiles.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default FilesTab;