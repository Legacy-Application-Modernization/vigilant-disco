import { useState } from 'react';
import type { FC } from 'react';
import { ChevronRight, GitBranch, Loader2 } from 'lucide-react';

interface Repository {
  name: string;
  url: string;
  branch: string;
  owner: string;
}

interface UploadFilesProps {
  onAnalyzeCode: () => void;
}

const UploadFiles: FC<UploadFilesProps> = ({ 
  onAnalyzeCode
}) => {
  const [gitUrl, setGitUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedRepo, setImportedRepo] = useState<Repository | null>(null);

  // Handle Git URL import
  const handleGitImport = async () => {
    if (!gitUrl.trim()) {
      setError('Please enter a Git repository URL');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      // Extract repository name and owner from URL
      const urlParts = gitUrl.trim().split('/');
      const repoName = urlParts[urlParts.length - 1].replace('.git', '');
      const owner = urlParts[urlParts.length - 2];

      if (!owner || !repoName) {
        throw new Error('Invalid Git URL format. Expected format: https://github.com/owner/repository.git');
      }

      // Store repository data in localStorage
      const repoData = {
        name: repoName,
        url: gitUrl.trim(),
        branch: branch || 'main',
        owner: owner,
      };

      localStorage.setItem('selectedRepository', JSON.stringify(repoData));
      setImportedRepo(repoData);
      
      setIsImporting(false);
    } catch (err) {
      console.error('Git import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process Git URL');
      setIsImporting(false);
    }
  };

  // Clear imported repository
  const handleClearRepository = () => {
    setImportedRepo(null);
    setGitUrl('');
    setBranch('main');
    setError(null);
    
    // Clear all cached data when user clears the repository
    localStorage.removeItem('selectedRepository');
    localStorage.removeItem('cachedAnalysisResult');
    localStorage.removeItem('cachedConversionPlanner');
    localStorage.removeItem('cachedTransformationData');
    
    // Also clear all repository-specific caches
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cachedAnalysisResult_') || 
          key.startsWith('cachedConversionPlanner_') || 
          key.startsWith('cachedTransformationData_')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('Cleared all cached data');
  };

  return (
    <div className="p-8">
      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600 text-xl px-2"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Import Zone or Analysis View */}
      {!importedRepo ? (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 mb-6 flex flex-col items-center justify-center">
          <div className="bg-indigo-500 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <GitBranch size={28} />
          </div>
          <h2 className="text-xl font-semibold mb-2">Import your PHP project</h2>
          <p className="text-gray-500 mb-6">Enter your Git repository URL to import your PHP project</p>
          
          <div className="w-full max-w-2xl space-y-4">
            <div>
              <label htmlFor="gitUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Git Repository URL
              </label>
              <input
                id="gitUrl"
                type="text"
                value={gitUrl}
                onChange={(e) => setGitUrl(e.target.value)}
                placeholder="https://github.com/username/repository.git"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                disabled={isImporting}
              />
            </div>
            
            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
                Branch (optional)
              </label>
              <input
                id="branch"
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                disabled={isImporting}
              />
            </div>

            <button
              onClick={handleGitImport}
              disabled={isImporting || !gitUrl.trim()}
              className="w-full bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Import Repository
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
          
          <div className="text-sm text-gray-400 mt-6">
            Supports: Public and private repositories • All PHP frameworks • Laravel, Symfony, CodeIgniter, etc.
          </div>
        </div>
      ) : (
        /* Analysis View */
        <div className="space-y-6">
          {/* Repository Header Card */}
          <div className="border-2 border-indigo-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                    <GitBranch size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{importedRepo.name}</h2>
                    <p className="text-indigo-100">{importedRepo.owner}/{importedRepo.name}</p>
                  </div>
                </div>
                <button
                  onClick={handleClearRepository}
                  className="text-white/80 hover:text-white transition-colors"
                  title="Clear repository"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Owner */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-2 uppercase font-semibold">Owner</p>
                  <p className="font-medium text-gray-900">{importedRepo.owner}</p>
                </div>

                {/* Repository Name */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-2 uppercase font-semibold">Repository</p>
                  <p className="font-medium text-gray-900">{importedRepo.name}</p>
                </div>

                {/* Branch */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-2 uppercase font-semibold">Branch</p>
                  <div className="flex items-center gap-2">
                    <GitBranch size={18} className="text-gray-500" />
                    <p className="font-medium text-gray-900">{importedRepo.branch}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onAnalyzeCode()}
            className="w-full bg-indigo-500 text-white px-6 py-4 rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 font-medium shadow-lg shadow-indigo-500/30"
          >
            Start Migration Analysis
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadFiles;