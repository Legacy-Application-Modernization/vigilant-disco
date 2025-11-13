import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import AnalysisDashboard from './AnalysisDashboard';
import type { AnalysisData } from '../../types/analysis.types';
// Uncomment this for testing with sample data:
import { sampleAnalysisData } from '../../data/sampleAnalysisData';

const AnalysisReport: FC = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        console.log(sampleAnalysisData);
        // FOR TESTING: Uncomment these lines to use sample data
        setAnalysisData(sampleAnalysisData);
        setLoading(false);
        return;
        
        // TODO: Replace with your actual API endpoint
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/analysis/latest`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch analysis: ${response.statusText}`);
        }

        const data = await response.json();
        setAnalysisData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching analysis:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analysis report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white rounded-lg shadow-lg border border-red-200 p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
            Error Loading Analysis
          </h3>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-600">No analysis data available</p>
          <p className="text-sm text-gray-500 mt-2">
            Run an analysis on a project to see detailed insights
          </p>
        </div>
      </div>
    );
  }

  return (
    <AnalysisDashboard
      analysisData={analysisData}
      projectName="PHP to Node.js Migration"
    />
  );
};

export default AnalysisReport;