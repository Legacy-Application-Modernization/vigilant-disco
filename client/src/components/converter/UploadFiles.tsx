import { useState } from 'react';
import type { FC } from 'react';
import { ChevronRight, GitBranch, Loader2, CheckCircle } from 'lucide-react';
import { auth } from '../../config/firebase';
import backendService from '../../services/backend.service';
import ErrorDisplay from '../common/ErrorDisplay';
import { cacheManager } from '../../utils/cacheManager';

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
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedRepo, setImportedRepo] = useState<Repository | null>(null);
  const [existingProject, setExistingProject] = useState<any>(null);

  // Handle Git URL import and check for existing project
  const handleGitImport = async () => {
    if (!gitUrl.trim()) {
      setError('Please enter a Git repository URL');
      return;
    }

    setIsImporting(true);
    setError(null);
    setExistingProject(null);

    try {
      const user = auth?.currentUser;
      if (!user) {
        throw new Error('Please log in to continue');
      }

      // Extract repository name and owner from URL
      const urlParts = gitUrl.trim().split('/');
      const repoName = urlParts[urlParts.length - 1].replace('.git', '');
      const owner = urlParts[urlParts.length - 2];

      if (!owner || !repoName) {
        throw new Error('Invalid Git URL format. Expected format: https://github.com/owner/repository.git');
      }

      const projectName = `${owner}/${repoName}`;

      // Check if project already exists in Firebase
      setIsCheckingExisting(true);
      console.log('Checking for existing project:', projectName);

      try {
        const projectsResponse = await backendService.getUserProjects(user.uid);
        
        // Find project matching this repository URL
        const existingProj = projectsResponse.projects?.find(
          (proj: any) => proj.repository_url === gitUrl.trim() || proj.project_name === projectName
        );

        if (existingProj) {
          console.log('Found existing project:', existingProj);
          setExistingProject(existingProj);

          // Load existing project data into cache
          await loadExistingProjectData(existingProj);

          setImportedRepo({
            name: repoName,
            url: gitUrl.trim(),
            branch: branch || 'main',
            owner: owner,
          });
        } else {
          console.log('No existing project found, will create new one');
          // Store repository data in localStorage for new project
          const repoData = {
            name: repoName,
            url: gitUrl.trim(),
            branch: branch || 'main',
            owner: owner,
          };

          localStorage.setItem('selectedRepository', JSON.stringify(repoData));
          setImportedRepo(repoData);
        }
      } catch (err: any) {
        console.warn('Error checking for existing project:', err);
        // Continue with new project flow if check fails
        const repoData = {
          name: repoName,
          url: gitUrl.trim(),
          branch: branch || 'main',
          owner: owner,
        };

        localStorage.setItem('selectedRepository', JSON.stringify(repoData));
        setImportedRepo(repoData);
      } finally {
        setIsCheckingExisting(false);
      }

      setIsImporting(false);
    } catch (err) {
      console.error('Git import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process Git URL');
      setIsImporting(false);
      setIsCheckingExisting(false);
    }
  };

  // Load existing project data into localStorage cache
  const loadExistingProjectData = async (project: any) => {
    try {
      console.log('Loading existing project data into cache...');

      // Store repository info for UI continuity
      const repoData = {
        name: project.project_name?.split('/')[1] || project.repo,
        url: project.repository_url,
        branch: 'main',
        owner: project.project_name?.split('/')[0] || project.owner,
      };
      localStorage.setItem('selectedRepository', JSON.stringify(repoData));

      // Store only essential data needed for the session
      // Keep selectedRepository for UI continuity
      // Keep currentProjectId for API calls
      // Keep failedPhases for retry functionality
      // Data itself comes from DB, no need to cache it in localStorage

      // Detect failed phases for retry functionality
      if (project.migrated_code && Array.isArray(project.migrated_code)) {
        const phaseResults = project.migrated_code
          .map((phase: any) => phase.phaseresults)
          .filter(Boolean)
          .filter((result: any) => result && typeof result === 'object');

        const failedPhases = phaseResults
          .filter((result: any) => {
            // Check if this phase has valid data
            if (!result || typeof result !== 'object') return false;
            
            // Check for zero files converted
            if (result.files_converted === 0) return true;
            
            // Check for failed conversions (only if conversion_results exists)
            if (result.conversion_results && Array.isArray(result.conversion_results)) {
              return result.conversion_results.some((cr: any) => !cr?.success);
            }
            
            return false;
          })
          .map((result: any) => result.phase_number)
          .filter((num: any) => typeof num === 'number');

        if (failedPhases.length > 0) {
          console.warn('⚠️ Found failed phases:', failedPhases);
          localStorage.setItem('failedPhases', JSON.stringify(failedPhases));
        }
      }

      // Store project ID for API calls
      localStorage.setItem('currentProjectId', project.id);

      console.log('✓ Existing project loaded from database');
    } catch (err) {
      console.error('Error loading existing project data:', err);
    }
  };

  // Clear imported repository
  const handleClearRepository = async () => {
    setImportedRepo(null);
    setGitUrl('');
    setBranch('main');
    setError(null);

    // Clear all cached data when user clears the repository
    localStorage.removeItem('selectedRepository');

    // Clear IndexedDB cache
    await cacheManager.clear();

    console.log('Cleared all cached data');
  };

  return (
    <div className="p-8">
      {/* Error Alert */}
      {error && (
        <ErrorDisplay 
          error={error}
          title="Import Error"
          onDismiss={() => setError(null)}
          variant="error"
        />
      )}

      {/* Existing Project Found Alert */}
      {existingProject && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800">Existing Project Found!</h3>
              <p className="mt-1 text-sm text-green-700">
                We found an existing project for this repository. 
                Your previous analysis and migration data have been loaded.
              </p>
              <div className="mt-2 text-xs text-green-600">
                <div>Status: <span className="font-medium">{existingProject.status}</span></div>
                <div>Last updated: {new Date(existingProject.updated_at).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checking Existing Project Loading */}
      {isCheckingExisting && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Loader2 className="h-5 w-5 text-blue-400 animate-spin mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Checking for existing project...</h3>
              <p className="text-sm text-blue-700">Please wait while we search for your repository data.</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Disclaimer */}
      <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">Important Note</h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>
                This tool uses AI to analyze and convert your PHP code to Node.js. While we strive for accuracy,
                <strong className="font-semibold"> AI-generated code may contain errors or require manual adjustments</strong>.
              </p>
              <p className="mt-2">
                Please carefully review all converted code, test thoroughly, and verify that the migrated application
                meets your requirements before deploying to production.
              </p>
            </div>
          </div>
        </div>
      </div>

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