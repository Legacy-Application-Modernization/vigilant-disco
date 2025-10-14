import { useState, useEffect } from 'react';
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
import type { AnalysisResult, ConversionOptions, FileStructure, TransformationData } from './types/conversion';
// import McpConnectionDialog from './components/McpConnectionDialog';
import { mcpService } from './services/mcpService';
import { codeImprovementService } from './services/codeImprovementService';

type TabType = 'dashboard' | 'projects' | 'reports' | 'profile' | 'converter' | 'templates' | 'settings' | 'help';

const App = () => {
  // Main navigation state
  // const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  // Using _mcpStatus to indicate it's used in UI rendering later
  const [_mcpStatus, setMcpStatus] = useState<{ isConnected: boolean; sessionToken: string | null }>({ isConnected: false, sessionToken: null });
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
useEffect(() => {
    const status = mcpService.getConnectionStatus();
    setMcpStatus(status);
    
    // if (!status.isConnected) {
    //   setShowConnectionDialog(true);
    // }
  }, []);
  
  // const handleConnectionSuccess = () => {
  //   setShowConnectionDialog(false);
  //   setMcpStatus(mcpService.getConnectionStatus());
  // };
  
  // Uncomment when disconnect functionality is needed in the UI
  // const handleDisconnect = () => {
  //   mcpService.disconnect();
  //   setMcpStatus(mcpService.getConnectionStatus());
  //   setShowConnectionDialog(true);
  // };
  // Converter state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    size: string;
    type: string;
  }>>([]);

  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);

  // Keeping setTransformationOptions for future use
  const [transformationOptions] = useState<ConversionOptions>({
    useAsync: true,
    convertToTypeScript: false,
    includeValidation: true,
    addErrorHandling: true,
    includeDocker: false,
    generateUnitTests: false
  });
// Handle transformation has been incorporated directly into the onReviewChanges callback

  // Sample code transformation data
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

  // Sample transformation summary data
  const transformationSummary = {
    filesConverted: 12,
    linesOfCode: 1247,
    coverage: 100,
    errors: 0,
    confidence: 85
  };

  // Sample file structure data
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

  // Navigate between steps in converter
  const goToStep = (step: number) => {
    if (step >= 1 && step <= 5) {
      setCurrentStep(step);
    }
  };

  // Handle file upload
  const handleFileUpload = () => {
    // In a real app, you would process the files here
    const sampleUploadedFiles = [
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

  // Analyze code
  const analyzeCode = () => {
    // In a real app, you would analyze the code here
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

  // Render the main content based on active tab
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
        return <UserProfile />;
      default:
        return <Dashboard onNewConversion={() => setActiveTab('converter')}/>;
    }
  };

  // Render the appropriate converter step
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
            // Just advance to the next step, we don't need to store the files
            goToStep(4);
          }}
            mcpService={codeImprovementService} // Pass the improvement service
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

  return (
    <div className="flex h-screen bg-gray-100">
       {/* <McpConnectionDialog
        isOpen={showConnectionDialog}
        onClose={() => setShowConnectionDialog(false)}
        onSuccess={handleConnectionSuccess}
      /> */}
      
      {/* Show connection status */}
        {/* <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full ${mcpStatus.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="ml-2 text-sm">
            MCP Server: {mcpStatus.isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {mcpStatus.isConnected && (
            <button 
              onClick={handleDisconnect}
              className="ml-2 text-xs text-indigo-600 hover:underline"
            >
              Disconnect
            </button>
          )}
        </div> */}
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => setActiveTab(tab)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default App;