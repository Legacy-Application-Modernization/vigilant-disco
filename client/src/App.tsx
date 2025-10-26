// src/App.tsx
import { useState, useEffect } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

// Original Components - keeping the original imports
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
import MigrationReview from './components/converter/MigrationReview';
import ExportProject from './components/converter/ExportProject';

// Authentication Component (only shows when not logged in)
import LoginRegister from './components/auth/LoginRegister';

// Original Types and Services
import type { AnalysisResult, ConversionOptions, FileStructure, TransformationData } from './types/conversion';
import { mcpService } from './services/mcpService';
import { codeImprovementService } from './services/codeImprovementService';

type TabType = 'dashboard' | 'projects' | 'reports' | 'profile' | 'converter' | 'templates' | 'settings' | 'help';

interface UploadedFile {
  name: string;
  size: string;
  type: string;
}

const App: React.FC = () => {
  // Firebase Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Original App State (restored)
  const [_mcpStatus, setMcpStatus] = useState<{ isConnected: boolean; sessionToken: string | null }>({ 
    isConnected: false, 
    sessionToken: null 
  });
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);

  const [transformationOptions] = useState<ConversionOptions>({
    useAsync: true,
    convertToTypeScript: false,
    includeValidation: true,
    addErrorHandling: true,
    includeDocker: false,
    generateUnitTests: false
  });

  // Firebase Auth Listener
  useEffect(() => {
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

  // Show loading only during initial auth check
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

  // Show auth error if needed
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

  // Original sample data (restored)
  const codeTransformation: TransformationData = {
    originalCode: `<?php
    
namespace App\\Http\\Controllers;

use App\\Models\\User;
use Illuminate\\Http\\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    public function store(Request $request)
    {
`,
    transformedCode: `const User = require('../models/User');
const validator = require('../utils/validator');

class UserController {
    async index(req, res) {
        try {
            const users = await User.findAll();
            return res.json(users);
        } catch (error) {
            return res.status(500).json({
                error: error.message
            });
        }
    }

    async store(req, res) {
        const errors = validator.validate(req);
`
  };

  const transformationSummary = {
    filesConverted: 12,
    linesOfCode: 1247,
    coverage: 100,
    errors: 0,
    confidence: 85
  };

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

  // Original helper functions (restored)
  const goToStep = (step: number): void => {
    if (step >= 1 && step <= 5) {
      setCurrentStep(step);
    }
  };

  const handleFileUpload = (): void => {
    const sampleUploadedFiles: UploadedFile[] = [
      {
        name: 'UserController.php',
        size: '2.4 KB',
        type: 'Laravel Controller'
      },
      {
        name: 'DatabaseService.php',
        size: '5.1 KB',
        type: 'Database Class'
      },
      {
        name: 'api.php',
        size: '1.8 KB',
        type: 'REST API Routes'
      }
    ];

    setUploadedFiles(sampleUploadedFiles);
  };

  const analyzeCode = (): void => {
    setAnalysisResults({
      metrics: {
        totalLinesOfCode: 1247,
        classesDetected: 12,
        functions: 45,
        complexityScore: 'Low'
      },
      framework: {
        name: 'Laravel 8.x',
        designPattern: 'MVC',
        database: 'MySQL',
        apiType: 'RESTful'
      },
      dependencies: {
        externalLibraries: 8,
        composerPackages: 15,
        nodejsEquivalents: 'Available',
        migrationDifficulty: 'Medium'
      }
    });
    goToStep(2);
  };

  // Original render functions (restored)
  const renderMainContent = () => {
    if (activeTab === 'converter') {
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-5">
            <ConversionStepper currentStep={currentStep} onStepClick={goToStep} />
          </div>

          <div className="bg-white rounded-xl shadow-lg flex-grow overflow-hidden">
            {renderConverterStep()}
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNewConversion={() => setActiveTab('converter')} />;
      case 'projects':
        return <Projects />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <UserProfile user={user} />;
      default:
        return <Dashboard onNewConversion={() => setActiveTab('converter')}/>;
    }
  };

  const renderConverterStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <UploadFiles
            uploadedFiles={uploadedFiles}
            onFileUpload={handleFileUpload}
            onAnalyzeCode={analyzeCode}
          />
        );
      case 2:
        return (
          <CodeAnalysis
            results={analysisResults}
            onStartTransformation={() => goToStep(3)}
          />
        );
      case 3:
        return (
          <CodeTransformation 
            originalCode={codeTransformation.originalCode}
            transformedCode={codeTransformation.transformedCode}
            options={transformationOptions}
            onReviewChanges={(_) => {
              goToStep(4);
            }}
            mcpService={codeImprovementService}
          />
        );
      case 4:
        return (
          <MigrationReview
            summary={transformationSummary}
            onExportProject={() => goToStep(5)}
          />
        );
      case 5:
        return (
          <ExportProject
            fileStructure={fileStructure}
          />
        );
      default:
        return (
          <UploadFiles
            uploadedFiles={uploadedFiles}
            onFileUpload={handleFileUpload}
            onAnalyzeCode={analyzeCode}
          />
        );
    }
  };

  // Original app layout (restored) with user prop added to components that need it
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - pass user for auth features */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => setActiveTab(tab)}
        user={user}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default App;