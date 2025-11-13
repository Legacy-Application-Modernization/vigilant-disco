import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  FileCode, 
  CheckCircle2, 
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';

// Update import paths as needed. If you use CRA/Vite, place JSON in src/
// Data now fetched from backend endpoints instead of local JSON files
// Endpoints used:
//  - http://127.0.0.1:8000/analyze_repository
//  - http://127.0.0.1:8000/conversion_plan

interface CodeAnalysisProps {
  projectId?: string;
  onBack?: () => void;
  onStartTransformation: () => void;
  onViewReports: (data: { analysisResult: any; conversionPlanner: any }) => void;
}

const CodeAnalysis: React.FC<CodeAnalysisProps> = ({
  onBack,
  onStartTransformation,
  onViewReports
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [conversionPlanner, setConversionPlanner] = useState<any>(null);

  const loadFromServer = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      // Step 1: Call analyze_repository first
      const analysisRes = await fetch('http://127.0.0.1:8000/analyze_repository', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Add any required payload here if needed
        })
      });

      if (!analysisRes.ok) {
        throw new Error('Analysis server responded with an error');
      }

      const analysisJson = await analysisRes.json();
      setAnalysisResult(analysisJson);

      // Step 2: Wait for analysis to complete, then call conversion_plan
      const plannerRes = await fetch('http://127.0.0.1:8000/conversion_plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Add any required payload here if needed
        })
      });

      if (!plannerRes.ok) {
        throw new Error('Conversion plan server responded with an error');
      }

      const plannerJson = await plannerRes.json();
      setConversionPlanner(plannerJson);
      setAnalysisComplete(true);
    } catch (err) {
      // Keep the error user-friendly; devs can inspect console for details
      console.error('Failed to load analysis/planner from server', err);
      setError('Failed to load analysis from server');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    // tiny delay for UI feedback (similar to previous behavior)
    const t = setTimeout(() => {
      void loadFromServer();
    }, 500);

    return () => clearTimeout(t);
  }, []);

  const handleViewReports = () => {
    if (analysisResult && conversionPlanner) {
      onViewReports({
        analysisResult,
        conversionPlanner
      });
    }
  };

  const getTotalFiles = () => {
    return analysisResult?.files_summary?.length || 0;
  };

  const getEstimatedTime = () => {
    if (!conversionPlanner?.phases) return 'N/A';
    
    const totalDays = conversionPlanner.phases.reduce((sum: number, phase: any) => {
      const days = parseInt(phase.estimated_time?.split(' ')[0]) || 0;
      return sum + days;
    }, 0);
    return `${totalDays} days`;
  };

  return (
    <div className="min-h-full">
      {onBack && (
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      )}

      <div className="space-y-6">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-900">Analysis Failed</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={() => {
                    // reuse the loader which sets loading/error states
                    void loadFromServer();
                  }}
                  className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : isAnalyzing ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Analyzing Your Code
              </h2>
              <p className="text-gray-600 text-center max-w-md">
                Analyzing code patterns and generating transformation strategy...
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>Processing files</span>
              </div>
            </div>
          </div>
        ) : analysisComplete ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Analysis Complete!
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Your PHP project has been successfully analyzed. We've identified the architecture, 
                    dependencies, and created a detailed conversion plan.
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <FileCode className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-gray-600 uppercase">Files Analyzed</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{getTotalFiles()}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-gray-600 uppercase">Migration Phases</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {conversionPlanner?.phases?.length || 0}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Loader2 className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-gray-600 uppercase">Estimated Time</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{getEstimatedTime()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {analysisResult && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Framework Detected</p>
                    <p className="text-base text-gray-900">
                      {analysisResult.framework_info.framework || 'Custom PHP'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Architecture Pattern</p>
                    <p className="text-base text-gray-900">
                      {analysisResult.architectural_insights.architectural_pattern}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Migration Complexity</p>
                    <p className="text-base text-gray-900">
                      {analysisResult.architectural_insights.migration_complexity}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Recommended Node.js Architecture</p>
                    <p className="text-base text-gray-900">
                      {analysisResult.architectural_insights.recommended_nodejs_architecture}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handleViewReports}
                className="flex-1 bg-white text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-300 flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                View Detailed Reports
              </button>
              <button
                onClick={onStartTransformation}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Start Transformation
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CodeAnalysis;
