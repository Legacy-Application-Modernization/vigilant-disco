import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { ChevronRight, Github, Loader2, ExternalLink, GitBranch } from 'lucide-react';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  updated_at: string;
  language: string;
  html_url: string;
  clone_url: string;
  default_branch: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface UploadFilesProps {
  onAnalyzeCode: () => void;
}

const UploadFiles: FC<UploadFilesProps> = ({ 
  onAnalyzeCode 
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [showRepoDialog, setShowRepoDialog] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(
    localStorage.getItem('github_token')
  );
  const [error, setError] = useState<string | null>(null);
  const [showRepoDetails, setShowRepoDetails] = useState(false);
  const [importedRepo, setImportedRepo] = useState<Repository | null>(null);

  // Reference githubToken to avoid unused variable TypeScript error
  useEffect(() => {
    void githubToken;
  }, [githubToken]);

  // Step 3: Fetch user's repositories
  const fetchRepositories = useCallback(async (token: string) => {
    try {
      console.log('Fetching repositories...');
      
      const response = await fetch(`${API_BASE_URL}/api/v1/github/repos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('GitHub token expired. Please reconnect.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Repositories response:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch repositories');
      }
      
      setRepositories(data.repositories);
    } catch (err) {
      console.error('Failed to fetch repositories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
      throw err;
    }
  }, []);

  // Step 2: Handle OAuth callback
  const handleOAuthCallback = useCallback(async (code: string) => {
    try {
      console.log('Exchanging code for token...');
      
      const response = await fetch(`${API_BASE_URL}/api/v1/github/callback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Callback response:', data);
      
      if (!data.success || !data.accessToken) {
        throw new Error(data.message || 'Failed to authenticate with GitHub');
      }
      
      const { accessToken } = data;
      setGithubToken(accessToken);
      localStorage.setItem('github_token', accessToken);
      
      await fetchRepositories(accessToken);
      setShowRepoDialog(true);
      
    } catch (err) {
      console.error('OAuth callback error:', err);
      setError(err instanceof Error ? err.message : 'Failed to authenticate with GitHub');
    } finally {
      setIsImporting(false);
    }
  }, [fetchRepositories]);

  // Handle redirect-based OAuth (if popup was blocked)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const githubAuth = urlParams.get('github_auth');
    const storedCode = localStorage.getItem('github_oauth_code');
    
    if (githubAuth === 'success' && storedCode) {
      console.log('Handling OAuth redirect with code from localStorage');
      setIsImporting(true);
      
      localStorage.removeItem('github_oauth_code');
      handleOAuthCallback(storedCode);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [handleOAuthCallback]);

  // Step 1: Initiate GitHub OAuth
  const handleGithubImport = async () => {
    setIsImporting(true);
    setError(null);
    
    try {
      console.log('Fetching auth URL from:', `${API_BASE_URL}/api/v1/github/auth`);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/github/auth`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Auth URL response:', data);
      
      if (!data.success || !data.authUrl) {
        throw new Error(data.message || 'Failed to get authorization URL');
      }
      
      const { authUrl } = data;
      
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const authWindow = window.open(
        authUrl,
        'GitHub Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
        console.log('Popup blocked, using redirect...');
        setError('Popup blocked. Redirecting to GitHub...');
        
        setTimeout(() => {
          window.location.href = authUrl;
        }, 1000);
        
        return;
      }

      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'github-oauth-success') {
          handleOAuthCallback(event.data.code);
          window.removeEventListener('message', handleMessage);
        } else if (event.data.type === 'github-oauth-error') {
          setError(`GitHub authorization failed: ${event.data.description || event.data.error}`);
          setIsImporting(false);
          window.removeEventListener('message', handleMessage);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
    } catch (err) {
      console.error('GitHub import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to GitHub');
      setIsImporting(false);
    }
  };

  // Step 4: Handle repository selection - SHOW DETAILS
  const handleRepoSelect = (repo: Repository) => {
    console.log('Repository selected:', {
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      cloneUrl: repo.clone_url,
      language: repo.language,
      isPrivate: repo.private,
      defaultBranch: repo.default_branch,
      description: repo.description,
      owner: repo.owner.login,
    });

    setSelectedRepo(repo);
    setShowRepoDetails(true);
  };

  // Step 5: Proceed with selected repository
  const handleProceedWithRepo = async () => {
    if (!selectedRepo) return;
    
    console.log('Proceeding with repository:', selectedRepo);
    
    // Store repository data in localStorage for CodeAnalysis component
    localStorage.setItem('selectedRepository', JSON.stringify({
      owner: selectedRepo.owner.login,
      name: selectedRepo.name,
      clone_url: selectedRepo.clone_url,
      default_branch: selectedRepo.default_branch,
      html_url: selectedRepo.html_url,
    }));
    
    setImportedRepo(selectedRepo);
    setShowRepoDialog(false);
    setShowRepoDetails(false);
    setSelectedRepo(null);
    setError(null);
  };

  // Clear imported repository
  const handleClearRepository = () => {
    setImportedRepo(null);
    setError(null);
  };

  // Back to repository list
  const handleBackToList = () => {
    setShowRepoDetails(false);
    setSelectedRepo(null);
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
            <Github size={28} />
          </div>
          <h2 className="text-xl font-semibold mb-2">Import your PHP project</h2>
          <p className="text-gray-500 mb-4">Connect to GitHub to import your PHP project</p>
          
          <div className="flex gap-4">
            <button
              onClick={handleGithubImport}
              disabled={isImporting}
              className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Import from GitHub
                  <Github size={16} className="ml-2" />
                </>
              )}
            </button>
          </div>
          
          <div className="text-sm text-gray-400 mt-4">
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
                    <Github size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{importedRepo.name}</h2>
                    <p className="text-indigo-100">{importedRepo.description || 'No description'}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Owner */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-2 uppercase font-semibold">Owner</p>
                  <div className="flex items-center gap-2">
                    <img 
                      src={importedRepo.owner.avatar_url} 
                      alt={importedRepo.owner.login}
                      className="w-8 h-8 rounded-full"
                    />
                    <p className="font-medium text-gray-900">{importedRepo.owner.login}</p>
                  </div>
                </div>

                {/* Language */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-2 uppercase font-semibold">Language</p>
                  <p className="font-medium text-gray-900">{importedRepo.language || 'Not specified'}</p>
                </div>

                {/* Visibility */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-2 uppercase font-semibold">Visibility</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    importedRepo.private ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {importedRepo.private ? 'Private' : 'Public'}
                  </span>
                </div>

                {/* Default Branch */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-2 uppercase font-semibold">Default Branch</p>
                  <div className="flex items-center gap-2">
                    <GitBranch size={18} className="text-gray-500" />
                    <p className="font-medium text-gray-900">{importedRepo.default_branch}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          

                {/* Action Button */}
                <button
                  onClick={() => onAnalyzeCode()}
                  className="w-100 bg-indigo-500 text-white px-6 py-4 rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 font-medium shadow-lg shadow-indigo-500/30"
                >
                  Start Migration Analysis
                  <ChevronRight size={20} />
                </button>
              </div>

           
      )}

      {/* Repository Selection Dialog */}
      {showRepoDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            
            {/* VIEW 1: Repository Details */}
            {showRepoDetails && selectedRepo ? (
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">{selectedRepo.name}</h3>
                    <p className="text-gray-600">{selectedRepo.description || 'No description'}</p>
                  </div>
                  <button
                    onClick={handleBackToList}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Repository Information Card */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Owner</p>
                      <div className="flex items-center gap-2">
                        <img 
                          src={selectedRepo.owner.avatar_url} 
                          alt={selectedRepo.owner.login}
                          className="w-6 h-6 rounded-full"
                        />
                        <p className="font-medium">{selectedRepo.owner.login}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Language</p>
                      <p className="font-medium">{selectedRepo.language || 'Not specified'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Visibility</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${
                        selectedRepo.private ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedRepo.private ? 'Private' : 'Public'}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Default Branch</p>
                      <div className="flex items-center gap-1">
                        <GitBranch size={16} className="text-gray-500" />
                        <p className="font-medium">{selectedRepo.default_branch}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Repository URL</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-200 text-sm">
                        {selectedRepo.html_url}
                      </code>
                      <a
                        href={selectedRepo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Clone URL</p>
                    <code className="block bg-white px-3 py-2 rounded border border-gray-200 text-sm">
                      {selectedRepo.clone_url}
                    </code>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleBackToList}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Back to List
                  </button>
                  <button
                    onClick={handleProceedWithRepo}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 flex items-center gap-2"
                  >
                    Proceed with this Repository
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ) : (
              /* VIEW 2: Repository List */
              <div>
                <h3 className="text-xl font-semibold mb-4">Select a Repository</h3>
                <div className="space-y-2">
                  {repositories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No repositories found. Make sure you have repositories in your GitHub account.
                    </div>
                  ) : (
                    repositories.map((repo) => (
                      <button
                        key={repo.id}
                        onClick={() => handleRepoSelect(repo)}
                        className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-lg">{repo.name}</div>
                            <div className="text-sm text-gray-500">{repo.description || 'No description'}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {repo.language && (
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                {repo.language}
                              </span>
                            )}
                            {repo.private && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                Private
                              </span>
                            )}
                            <ChevronRight size={20} className="text-gray-400" />
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowRepoDialog(false);
                      setRepositories([]);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadFiles;