// components/converter/CodeTransformation.tsx
import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  RefreshCw, 
  File, 
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  XCircle
} from 'lucide-react';
import { auth } from '../../config/firebase';
import { backendApi } from '../../config/api';
import { usePhaseNotifications } from '../../contexts/PhaseNotificationContext';

interface ConversionResult {
  source_file: string;
  target_file: string;
  source_code: string;
  converted_code: string;
  dependencies?: string[];
  success: boolean;
  error?: string;
}

interface PhaseResult {
  phase_number: number;
  phase_name: string;
  files_converted: number;
  conversion_results: ConversionResult[];
}

interface TransformationData {
  phaseresults: PhaseResult[];
  dependencies: string[];
}

interface CodeTransformationProps {
  onBack: () => void;
  onNext: () => void;
  onCancelTransformation?: () => void;
}

const CodeTransformation: FC<CodeTransformationProps> = ({ 
  onBack,
  onNext,
  onCancelTransformation
}) => {
  const { addNotification } = usePhaseNotifications();
  
  // Initialize state from localStorage if available
  const [transformationData, setTransformationData] = useState<TransformationData | null>(() => {
    // Get current repository info
    const storedRepo = localStorage.getItem('selectedRepository');
    if (!storedRepo) return null;
    
    try {
      const parsedRepo = JSON.parse(storedRepo);
      const repoKey = `${parsedRepo.owner?.login || parsedRepo.owner}_${parsedRepo.name || parsedRepo.repo}`;
      
      // Check if we have cached data for this specific repository
      const cacheKey = `cachedTransformationData_${repoKey}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          console.log('Found cached transformation data for repository:', repoKey);
          return JSON.parse(cached);
        } catch (e) {
          console.error('Failed to parse cached transformation data', e);
          return null;
        }
      }
    } catch (e) {
      console.error('Failed to parse repository data', e);
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [processingPhases, setProcessingPhases] = useState(false); // Start as false, will be set to true when fetching starts
  const [currentPhase, setCurrentPhase] = useState(0);
  const [totalPhases, setTotalPhases] = useState(0);
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);
  const [improvingFiles, setImprovingFiles] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  // Fetch transformation data on mount
  useEffect(() => {
    // If we already have cached data, just stop loading
    if (transformationData) {
      console.log('Using cached transformation data');
      setLoading(false);
      setProcessingPhases(false); // Mark processing as complete
      return;
    }

    // Only fetch once using ref to prevent duplicate calls in React Strict Mode
    if (hasFetchedRef.current) {
      console.log('Already fetched or fetching, skipping duplicate call');
      return;
    }

    // Only fetch if we don't already have data
    if (!transformationData && !error) {
      hasFetchedRef.current = true;
      fetchTransformationData();
    }

    // Cleanup function to handle component unmount
    return () => {
      // Don't reset the ref on unmount - we want to prevent refetch on remount
    };
  }, []); // Empty dependency array - only run once on mount

  const fetchTransformationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user ID from Firebase
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        setError('User not authenticated. Please log in.');
        setLoading(false);
        return;
      }
      const userId = currentUser.uid;

      // Get repository data from localStorage
      let repoData = null;
      const storedRepo = localStorage.getItem('selectedRepository');
      if (storedRepo) {
        try {
          const parsedRepo = JSON.parse(storedRepo);
          repoData = {
            owner: parsedRepo.owner?.login || parsedRepo.owner,
            repo: parsedRepo.name || parsedRepo.repo,
            user_id: userId
          };
        } catch (e) {
          console.error('Failed to parse stored repository data', e);
        }
      }

      // Fallback to default values if no repo data found
      if (!repoData) {
        repoData = {
          owner: "Legacy-Application-Modernization",
          repo: "Blog-API-PHP",
          user_id: userId
        };
      }

      // Get conversion planner to know how many phases to process
      const cachedPlanner = localStorage.getItem('cachedConversionPlanner');
      if (!cachedPlanner) {
        setError('No conversion plan found. Please complete the analysis first.');
        setLoading(false);
        return;
      }

      const conversionPlanner = JSON.parse(cachedPlanner);
      const phases = conversionPlanner.phases || [];
      
      if (phases.length === 0) {
        setError('No phases found in conversion plan.');
        setLoading(false);
        return;
      }

      console.log(`Starting migration for ${phases.length} phases...`);
      setTotalPhases(phases.length);
      setProcessingPhases(true); // Now we're actually processing
      setLoading(false); // Stop initial loading to show progressive results

      // Collect all phase results
      const allPhaseResults: PhaseResult[] = [];
      const allDependencies = new Set<string>();

      // Call migrate_codebase for each phase
      for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];
        const phaseNumber = i + 1; // Start from 1
        const isLastPhase = i === phases.length - 1;

        setCurrentPhase(phaseNumber); // Display phase number (1-based)
        console.log(`Processing Phase ${phaseNumber}: ${phase.name}${isLastPhase ? ' (final phase)' : ''}`);

        try {
          const res = await backendApi.post('/migration/migrate_codebase', {
            owner: repoData.owner,
            repo: repoData.repo,
            user_id: userId,
            phase_num: phaseNumber,
            is_last_phase: isLastPhase
          });

          // Extract migrated_code from the response
          const migratedData = res.data.migrated_code;
          
          if (migratedData && migratedData.phaseresults) {
            const phaseResult = migratedData.phaseresults;
            
            // Add to aggregated results
            allPhaseResults.push(phaseResult);

            // Collect dependencies from conversion results
            if (phaseResult.conversion_results) {
              phaseResult.conversion_results.forEach((result: ConversionResult) => {
                if (result.dependencies) {
                  result.dependencies.forEach((dep: string) => allDependencies.add(dep));
                }
              });
            }

            console.log(`✓ Phase ${phaseNumber} completed: ${phaseResult.files_converted} files converted`);

            // Add phase completion notification
            addNotification({
              phase_number: phaseNumber,
              phase_name: phaseResult.phase_name,
              repository: `${repoData.owner}/${repoData.repo}`
            });

            // Update state immediately to display this phase's results
            setTransformationData({
              phaseresults: [...allPhaseResults],
              dependencies: Array.from(allDependencies)
            });
          }
        } catch (err: any) {
          console.error(`Failed to migrate phase ${phaseNumber}:`, err);
          // Continue with other phases even if one fails
          const errorResult: PhaseResult = {
            phase_number: phaseNumber,
            phase_name: phase.name,
            files_converted: 0,
            conversion_results: [{
              source_file: 'N/A',
              target_file: 'N/A',
              source_code: '',
              converted_code: '',
              success: false,
              error: `Phase ${phaseNumber} migration failed: ${err.message || 'Unknown error'}`
            }]
          };
          allPhaseResults.push(errorResult);
          
          // Update state to show error for this phase
          setTransformationData({
            phaseresults: [...allPhaseResults],
            dependencies: Array.from(allDependencies)
          });
        }
      }

      // Build final transformation data
      const finalData: TransformationData = {
        phaseresults: allPhaseResults,
        dependencies: Array.from(allDependencies)
      };

      setTransformationData(finalData);
      setProcessingPhases(false);
      
      // Cache the data in localStorage with repository-specific key
      const repoKey = `${repoData.owner}_${repoData.repo}`;
      const cacheKey = `cachedTransformationData_${repoKey}`;
      //localStorage.setItem(cacheKey, JSON.stringify(finalData));
      console.log('✓ Cached transformation data for repository:', repoKey);
      console.log(`✓ Migration complete: ${allPhaseResults.length} phases processed`);

    } catch (err) {
      setError('Failed to load transformation data. Please try again.');
      console.error('Error fetching transformation:', err);
      setLoading(false);
      setProcessingPhases(false);
    }
  };

  const toggleFileExpansion = (fileId: string) => {
    setExpandedFileId(expandedFileId === fileId ? null : fileId);
  };

  const improveCode = async (sourceFile: string, phaseNumber: number) => {
    const fileId = `${phaseNumber}-${sourceFile}`;
    
    try {
      setImprovingFiles(prev => new Set(prev).add(fileId));

      // TODO: Replace with actual AI improvement API call
      // const response = await fetch(`/api/improve-code`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ projectId, sourceFile, phaseNumber })
      // });
      // const improvedCode = await response.json();

      // Simulate AI improvement
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update the code with improvements (placeholder)
      console.log('Code improved for:', sourceFile);
      
    } catch (error) {
      console.error('Failed to improve code:', error);
      alert('Failed to improve code. Please try again.');
    } finally {
      setImprovingFiles(prev => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });
    }
  };

  const downloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllFiles = () => {
    if (!transformationData?.phaseresults) return;

    transformationData.phaseresults.forEach(phase => {
      const results = phase?.conversion_results || [];
      results.forEach(result => {
        if (result?.target_file && result?.converted_code) {
          downloadFile(result.target_file, result.converted_code);
        }
      });
    });
  };

  const getTotalFiles = () => {
    if (!transformationData?.phaseresults) return 0;
    return transformationData.phaseresults.reduce(
      (sum, phase) => sum + (phase?.files_converted || 0), 
      0
    );
  };

  const getSuccessRate = () => {
    if (!transformationData?.phaseresults) return 0;
    const total = getTotalFiles();
    if (total === 0) return 0;
    
    const successful = transformationData.phaseresults.reduce(
      (sum, phase) => {
        const results = phase?.conversion_results || [];
        return sum + results.filter(r => r?.success).length;
      },
      0
    );
    
    return Math.round((successful / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-gray-600">Initializing code transformation...</p>
        </div>
      </div>
    );
  }

  if (error && !transformationData) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Transformation Failed</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchTransformationData}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If still processing and no data yet, show loading with progress
  if (processingPhases && !transformationData) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Code Transformation In Progress</h2>
          <p className="text-gray-600">
            Processing phase {currentPhase} of {totalPhases}... Please wait while we transform your code.
          </p>
        </div>
        
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-sm font-medium text-blue-900">
                Processing Phase {currentPhase} of {totalPhases}
              </span>
            </div>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 animate-pulse"
              style={{ width: `${(currentPhase / totalPhases) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Transforming your PHP code to Node.js...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few minutes depending on your codebase size.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Code Transformation {processingPhases ? 'In Progress' : 'Complete'}</h2>
        <p className="text-gray-600">
          {processingPhases 
            ? `Processing phase ${currentPhase} of ${totalPhases}... Results will appear as each phase completes.`
            : 'Review the converted files and their transformations'
          }
        </p>
      </div>

      {/* Progress Indicator */}
      {processingPhases && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-sm font-medium text-blue-900">
                Processing Phase {currentPhase} of {totalPhases}
              </span>
            </div>
            <span className="text-sm text-blue-700">
              {transformationData?.phaseresults.length || 0} phase{(transformationData?.phaseresults.length || 0) !== 1 ? 's' : ''} completed
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((transformationData?.phaseresults.length || 0) / totalPhases) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Show results if we have any data */}
      {transformationData && transformationData?.phaseresults?.length > 0 && (
        <>
          {/* Statistics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900">{getTotalFiles()}</p>
                </div>
                <File className="w-8 h-8 text-indigo-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Success Rate</p>
                  <p className="text-2xl font-bold text-emerald-600">{getSuccessRate()}%</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Phases</p>
                  <p className="text-2xl font-bold text-gray-900">{transformationData?.phaseresults?.length || 0}</p>
                </div>
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                  {transformationData?.phaseresults?.length || 0}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Dependencies</p>
                  <p className="text-2xl font-bold text-gray-900">{transformationData?.dependencies?.length || 0}</p>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {transformationData?.dependencies?.slice(0, 2).join(', ') || ''}
                  {(transformationData?.dependencies?.length || 0) > 2 && '...'}
                </div>
              </div>
            </div>
          </div>

          {/* Phase Results */}
          <div className="space-y-6 mb-8">
            {transformationData?.phaseresults?.map((phase) => (
          <div key={phase.phase_number} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Phase {phase.phase_number}: {phase.phase_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {phase.files_converted} {phase.files_converted === 1 ? 'file' : 'files'} converted
                  </p>
                </div>
                <div className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                  {(phase?.conversion_results || []).filter(r => r?.success).length}/{phase.files_converted} Success
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {(phase?.conversion_results || []).map((result, idx) => {
                const fileId = `${phase.phase_number}-${result.source_file}`;
                const isExpanded = expandedFileId === fileId;
                const isImproving = improvingFiles.has(fileId);

                return (
                  <div key={idx} className="bg-white">
                    {/* File Header */}
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleFileExpansion(fileId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {result.success ? (
                            <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                          ) : (
                            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {result.source_file} → {result.target_file}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Click to {isExpanded ? 'collapse' : 'expand'} code comparison
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          size={20}
                          className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="p-4 bg-gray-50 border-t border-gray-200">
                        {/* Action Buttons */}
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-sm text-gray-600">
                            Original: <span className="font-mono text-xs">{result.source_file}</span>
                            <span className="mx-2">→</span>
                            Converted: <span className="font-mono text-xs">{result.target_file}</span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              className="px-3 py-1.5 text-xs bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={(e) => {
                                e.stopPropagation();
                                improveCode(result.source_file, phase.phase_number);
                              }}
                              disabled={isImproving}
                            >
                              <RefreshCw size={14} className={`mr-1 ${isImproving ? 'animate-spin' : ''}`} />
                              {isImproving ? 'Improving...' : 'AI Improve'}
                            </button>
                            <button
                              className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadFile(result.target_file, result.converted_code);
                              }}
                            >
                              <Download size={14} className="mr-1" />
                              Download
                            </button>
                          </div>
                        </div>

                        {/* Code Comparison */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Original PHP Code */}
                          <div className="rounded-lg overflow-hidden border border-gray-300">
                            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 px-4 text-sm font-medium">
                              Original PHP
                            </div>
                            <pre className="bg-gray-900 text-gray-100 p-4 overflow-auto text-xs leading-relaxed h-96">
                              {result.source_code}
                            </pre>
                          </div>

                          {/* Converted Node.js Code */}
                          <div className="rounded-lg overflow-hidden border border-gray-300">
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 px-4 text-sm font-medium">
                              Converted Node.js
                            </div>
                            <pre className="bg-gray-900 text-gray-100 p-4 overflow-auto text-xs leading-relaxed h-96">
                              {result.converted_code}
                            </pre>
                          </div>
                        </div>

                        {/* Error Display */}
                        {!result.success && result.error && (
                          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-red-900">Conversion Error:</p>
                            <p className="text-sm text-red-700 mt-1">{result.error}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Dependencies Section */}
      {(transformationData?.dependencies?.length || 0) > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Required NPM Dependencies</h3>
          <div className="flex flex-wrap gap-2">
            {transformationData?.dependencies?.map((dep, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-mono rounded-full"
              >
                {dep}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Run: <code className="bg-gray-100 px-2 py-1 rounded">npm install {transformationData?.dependencies?.join(' ') || ''}</code>
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="text-indigo-500 px-6 py-2 rounded-md hover:bg-indigo-50 transition-colors flex items-center"
          >
            <ChevronLeft size={18} className="mr-1" /> Back to Analysis
          </button>
          
          {onCancelTransformation && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this transformation? All converted code will be discarded and you will need to start over.')) {
                  onCancelTransformation();
                }
              }}
              className="text-red-600 px-6 py-2 rounded-md hover:bg-red-50 transition-colors flex items-center border border-red-300"
            >
              <XCircle size={18} className="mr-1" /> Cancel Transformation
            </button>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={downloadAllFiles}
            disabled={processingPhases}
            className="px-6 py-2 border border-indigo-500 text-indigo-500 rounded-md hover:bg-indigo-50 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} className="mr-2" />
            Download All Files
          </button>

          <button
            onClick={onNext}
            disabled={processingPhases}
            className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processingPhases ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Export <ChevronRight size={18} className="ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default CodeTransformation;