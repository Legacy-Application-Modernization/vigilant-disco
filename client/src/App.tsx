import { useState, useEffect } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

// Auth Context
import { AuthProvider } from './contexts/AuthContext';

// Original Components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Projects from './components/projects/Projects';
import Reports from './components/reports/Reports';
import UserProfile from './components/profile/UserProfile';
import ConversionStepper from './components/converter/ConversionStepper';
import UploadFiles from './components/converter/UploadFiles';
import CodeAnalysis from './components/converter/CodeAnalysis';
import CodeTransformation from './components/converter/CodeTransformation';
import ExportProject from './components/converter/ExportProject';
import ProjectLimitDialog from './components/common/ProjectLimitDialog';

// Authentication Component
import LoginRegister from './components/auth/LoginRegister';

// Original Types and Services
import type { FileStructure } from './types/conversion';
import { mcpService } from './services/mcpService';
import apiService from './services/api';

// Migration utility
import { migrateFromLocalStorage } from './utils/migration';

type TabType = 'dashboard' | 'projects' | 'reports' | 'profile' | 'converter' | 'templates' | 'settings' | 'help';

// Main App Content Component (wrapped by AuthProvider)
const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Reports data state - for passing data between CodeAnalysis and Reports
  const [reportsData, setReportsData] = useState<{
    analysisResult: any;
    conversionPlanner: any;
  } | null>(null);

  // Original App State
  const [_mcpStatus, setMcpStatus] = useState<{ isConnected: boolean; sessionToken: string | null }>({ 
    isConnected: false, 
    sessionToken: null 
  });
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]); // Step 1 is always accessible
  // analysisResults state removed (unused) - reports use `reportsData` instead

  // transformationOptions removed (unused in this flow)

  // Project limit dialog state
  const [showProjectLimitDialog, setShowProjectLimitDialog] = useState<boolean>(false);
  const [projectLimitInfo, setProjectLimitInfo] = useState<{ currentCount: number; maxAllowed: number } | null>(null);
  
  // Project limits refresh key - increment to refresh header
  const [projectLimitsRefreshKey, setProjectLimitsRefreshKey] = useState<number>(0);

  // Firebase Auth Listener
  useEffect(() => {
    // Run migration from localStorage to IndexedDB on app startup
    migrateFromLocalStorage().catch(err => 
      console.error('Migration failed:', err)
    );

    if (!auth) {
      // Firebase not configured; skip auth listener and clear loading so app can show UI accordingly
      setAuthLoading(false);
      setAuthError(new Error('Firebase not configured'));
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setAuthLoading(false);
      },
      (error) => {
        setAuthError(error);
        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Original MCP Service Effect
  useEffect(() => {
    if (user) {
      try {
        const status = mcpService.getConnectionStatus();
        setMcpStatus(status);
      } catch (error) {
        console.warn('MCP service not available:', error);
      }
    }
  }, [user]);

  // Show loading during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth error
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Authentication Error: {authError.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginRegister />;
  }

  const fileStructure: FileStructure[] = [
    { name: 'my-nodejs-app/', type: 'folder', level: 0 },
    { name: 'src/', type: 'folder', level: 1 },
    { name: 'controllers/', type: 'folder', level: 2 },
    { name: 'models/', type: 'folder', level: 2 },
    { name: 'routes/', type: 'folder', level: 2 },
    { name: 'middleware/', type: 'folder', level: 2 },
    { name: 'utils/', type: 'folder', level: 2 },
    { name: 'config/', type: 'folder', level: 1 },
    { name: 'tests/', type: 'folder', level: 1 },
    { name: 'package.json', type: 'file', level: 1 },
    { name: '.env.example', type: 'file', level: 1 },
    { name: 'README.md', type: 'file', level: 1 },
    { name: 'Dockerfile', type: 'file', level: 1 },
  ];

  // Helper functions
  const goToStep = (step: number): void => {
    // Only allow navigation to completed steps or the current step
    if (step >= 1 && step <= 4 && (completedSteps.includes(step) || step === currentStep)) {
      setCurrentStep(step);
    }
  };

  const analyzeCode = (): void => {
    // Mark step 1 as completed and enable step 2
    setCompletedSteps(prev => {
      const updated = new Set(prev);
      updated.add(1);
      updated.add(2);
      return Array.from(updated);
    });
    setCurrentStep(2);
    // Refresh project limits after starting analysis
    setProjectLimitsRefreshKey(prev => prev + 1);
  };

  const handleCancelTransformation = (): void => {
    // Clear cached transformation data from localStorage
    try {
      const storedRepo = localStorage.getItem('selectedRepository');
      if (storedRepo) {
        const parsedRepo = JSON.parse(storedRepo);
        const repoKey = `${parsedRepo.owner?.login || parsedRepo.owner}_${parsedRepo.name || parsedRepo.repo}`;
        const cacheKey = `cachedTransformationData_${repoKey}`;
        localStorage.removeItem(cacheKey);
        console.log('Cleared transformation cache for repository:', repoKey);
      }
      // Also remove any generic cached transformation data
      localStorage.removeItem('cachedTransformationData');
    } catch (error) {
      console.error('Error clearing transformation cache:', error);
    }

    // Reset to step 1 (Upload Files)
    setCurrentStep(1);
    // Reset completed steps to only step 1
    setCompletedSteps([1]);
    
    // Optionally navigate to dashboard
    // setActiveTab('dashboard');
  };

  const handleNewConversion = async () => {
    try {
      // Check if user can create a new project
      const response = await apiService.checkCanCreateProject();

      if (response.success && response.data.canCreate) {
        // User can create project, navigate to converter
        setActiveTab("converter");
      } else {
        // User has reached limit, show dialog
        setProjectLimitInfo({
          currentCount: response.data.currentCount || 0,
          maxAllowed: response.data.maxAllowed || 2
        });
        setShowProjectLimitDialog(true);
      }
    } catch (error) {
      console.error('Error checking project limits:', error);
      // On error, allow navigation but log the issue
      setActiveTab("converter");
    }
  };

  // Render functions
  const renderMainContent = () => {
    if (activeTab === 'converter') {
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-5">
            <ConversionStepper currentStep={currentStep} completedSteps={completedSteps} onStepClick={goToStep} />
          </div>

          <div className="bg-white rounded-xl shadow-lg flex-grow overflow-hidden">
            {renderConverterStep()}
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNewConversion={handleNewConversion} />;
      case 'projects':
        return <Projects onNewConversion={handleNewConversion} />;
      case 'reports':
        return (
          <Reports
            analysisResult={reportsData?.analysisResult}
            conversionPlanner={reportsData?.conversionPlanner}
            onBack={() => setActiveTab('converter')}
          />
        );
      case 'profile':
        return <UserProfile user={user} />;
      default:
        return <Dashboard onNewConversion={handleNewConversion}/>;
    }
  };

  const renderConverterStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <UploadFiles
            onAnalyzeCode={analyzeCode}
          />
        );
      case 2:
        return (
          <CodeAnalysis
            projectId="current"
            onBack={() => goToStep(1)}
            onStartTransformation={() => {
              setCompletedSteps(prev => {
                const updated = new Set(prev);
                updated.add(1);
                updated.add(2);
                updated.add(3);
                return Array.from(updated);
              });
              setCurrentStep(3);
            }}
            onViewReports={(data) => {
              setReportsData(data);
              setActiveTab('reports');
            }}
          />
        );
      case 3:
        return (
          <CodeTransformation
            onBack={() => goToStep(2)}
            onNext={() => {
              setCompletedSteps(prev => {
                const updated = new Set(prev);
                updated.add(1);
                updated.add(2);
                updated.add(3);
                updated.add(4);
                return Array.from(updated);
              });
              setCurrentStep(4);
            }}
            onCancelTransformation={handleCancelTransformation}
          />
        );
      case 4:
        return (
          <ExportProject
            fileStructure={fileStructure}
            onBack={() => goToStep(3)}
            onComplete={() => {
              // Navigate to projects tab after successful save
              setActiveTab('projects');
              setCurrentStep(1);
              setCompletedSteps([1]); // Reset to initial state
              // Refresh project limits
              setProjectLimitsRefreshKey(prev => prev + 1);
            }}
          />
        );
      default:
        return (
          <UploadFiles
            onAnalyzeCode={analyzeCode}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab)}
        user={user}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user} 
          refreshKey={projectLimitsRefreshKey}
          onSearch={(query) => {
            setActiveTab('projects');
            // You can store the search query in state if needed
            console.log('Search query:', query);
          }}
        />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {renderMainContent()}
        </main>
      </div>

      {/* Project Limit Dialog */}
      {projectLimitInfo && (
        <ProjectLimitDialog
          isOpen={showProjectLimitDialog}
          onClose={() => setShowProjectLimitDialog(false)}
          currentCount={projectLimitInfo.currentCount}
          maxAllowed={projectLimitInfo.maxAllowed}
        />
      )}
    </div>
  );
};

// Main App Component with AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;