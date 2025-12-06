# Backend Integration Guide (Port 8000 - FastAPI)

## Overview

This guide explains how to integrate the FastAPI backend (port 8000) with the React client for comprehensive project lifecycle tracking using Firebase.

## What Changed

### 1. Enhanced Project Types (`types/project.ts`)

**New Status Tracking:**
```typescript
export type ProjectStatus = 
  | 'analyzing'      // Repository analysis in progress
  | 'analyzed'       // Analysis complete
  | 'planning'       // Migration plan being generated
  | 'planned'        // Migration plan ready
  | 'migrating'      // Code migration in progress
  | 'completed'      // Migration successful
  | 'failed';        // Migration failed
```

**Enhanced Project Interface:**
```typescript
export interface Project {
  id: string;                      // Firebase document ID
  project_name: string;            // Format: owner/repo
  user_id: string;                 // Firebase user ID
  repository_url: string;          // GitHub repo URL
  source_language: string;         // Always 'PHP'
  target_language: string;         // Always 'NodeJS'
  status: ProjectStatus;           // Current migration status
  created_at: string;              // ISO timestamp
  updated_at: string;              // ISO timestamp
  completed_at?: string;           // ISO timestamp when completed
  error?: string;                  // Error message if failed
  error_timestamp?: string;        // When error occurred
}
```

### 2. Backend Service (`services/backend.service.ts`)

**New API Methods:**

```typescript
// Step 1: Analyze Repository
await backendService.analyzeRepository({
  user_id: string,
  repo_url: string,
  project_name?: string
});

// Step 2: Generate Migration Plan
await backendService.generateMigrationPlan({
  user_id: string,
  project_id: string,
  repo_url: string
});

// Step 3: Migrate Code (3 phases)
await backendService.migrateCode({
  user_id: string,
  project_id: string,
  repo_url: string,
  phase: 1 | 2 | 3
});

// Fetch user projects
await backendService.getUserProjects(userId);

// Filter by status
await backendService.getProjectsByStatus(userId, status);

// Get project details
await backendService.getProjectDetails(projectId);
```

**Helper Methods:**
```typescript
// Get status badge styling
backendService.getStatusBadgeStyle(status);
// Returns: { bg: string, text: string, label: string }

// Calculate progress percentage
backendService.getProgressPercentage(status);
// Returns: 0-100

// Get next step in workflow
backendService.getNextStep(status);
// Returns: string | null
```

### 3. Updated Components

#### ProjectCard (`components/projects/ProjectCard.tsx`)

**New Features:**
- Status badges with proper Firebase status tracking
- Progress bar based on migration status
- Error message display for failed projects
- Timestamp tracking (created, updated, completed)
- Disabled download until migration is completed
- Next step indicators

**Usage:**
```tsx
<ProjectCard 
  project={project}
  onDelete={handleDeleteProject}
  onUpdate={updateProject}
  highlighted={highlightedProjectId === project.id}
/>
```

#### Projects List (`components/projects/Projects.tsx`)

**New Features:**
- Status filter dropdown with counts
- Support for all 7 project statuses
- Enhanced search (project name, repo URL)
- Status-based filtering

**Usage:**
```tsx
<Projects onNewConversion={() => setCurrentView('converter')} />
```

## Integration Examples

### Example 1: Start Repository Analysis

```typescript
import { auth } from '../config/firebase';
import backendService from '../services/backend.service';

async function startAnalysis(repoUrl: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  try {
    const response = await backendService.analyzeRepository({
      user_id: user.uid,
      repo_url: repoUrl,
      project_name: 'owner/repo'
    });

    console.log('Project ID:', response.project_id);
    console.log('Status:', response.status);
    console.log('Analysis Data:', response.analysis_data);

    return response;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}
```

### Example 2: Complete Migration Workflow

```typescript
async function runFullMigration(repoUrl: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  // Step 1: Analyze
  const analysis = await backendService.analyzeRepository({
    user_id: user.uid,
    repo_url: repoUrl
  });
  
  const projectId = analysis.project_id;

  // Step 2: Plan
  const plan = await backendService.generateMigrationPlan({
    user_id: user.uid,
    project_id: projectId,
    repo_url: repoUrl
  });

  // Step 3: Migrate (3 phases)
  for (let phase = 1; phase <= 3; phase++) {
    const result = await backendService.migrateCode({
      user_id: user.uid,
      project_id: projectId,
      repo_url: repoUrl,
      phase: phase as 1 | 2 | 3
    });
    
    console.log(`Phase ${phase} completed:`, result.status);
  }

  console.log('Migration complete!');
}
```

### Example 3: Display Project Status

```tsx
import backendService from '../services/backend.service';
import type { Project } from '../types/project';

function ProjectStatusDisplay({ project }: { project: Project }) {
  const { bg, text, label } = backendService.getStatusBadgeStyle(project.status);
  const progress = backendService.getProgressPercentage(project.status);
  const nextStep = backendService.getNextStep(project.status);

  return (
    <div>
      {/* Status Badge */}
      <span className={`px-2 py-1 rounded ${bg} ${text}`}>
        {label}
      </span>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded h-2 mt-2">
        <div 
          className="bg-blue-500 h-2 rounded"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Next Step */}
      {nextStep && (
        <div className="text-sm text-gray-600 mt-2">
          Next: {nextStep}
        </div>
      )}

      {/* Error Display */}
      {project.error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
          <strong>Error:</strong> {project.error}
        </div>
      )}
    </div>
  );
}
```

### Example 4: Fetch and Filter Projects

```typescript
import backendService from '../services/backend.service';
import { auth } from '../config/firebase';

async function fetchMyProjects() {
  const user = auth.currentUser;
  if (!user) return [];

  // Get all projects
  const allProjects = await backendService.getUserProjects(user.uid);
  console.log(`Total projects: ${allProjects.count}`);

  // Get only completed projects
  const completed = await backendService.getProjectsByStatus(user.uid, 'completed');
  console.log(`Completed: ${completed.count}`);

  // Get failed projects
  const failed = await backendService.getProjectsByStatus(user.uid, 'failed');
  console.log(`Failed: ${failed.count}`);

  return allProjects.projects;
}
```

### Example 5: Get Project Details

```typescript
async function showProjectDetails(projectId: string) {
  try {
    const response = await backendService.getProjectDetails(projectId);
    const project = response.project;

    console.log('Project Name:', project.project_name);
    console.log('Status:', project.status);
    console.log('Repository:', project.repository_url);
    console.log('Created:', new Date(project.created_at).toLocaleString());
    console.log('Updated:', new Date(project.updated_at).toLocaleString());
    
    if (project.completed_at) {
      console.log('Completed:', new Date(project.completed_at).toLocaleString());
    }

    if (project.error) {
      console.error('Error:', project.error);
      console.error('Error Time:', new Date(project.error_timestamp!).toLocaleString());
    }

    return project;
  } catch (error) {
    console.error('Failed to fetch project:', error);
  }
}
```

## API Endpoints Summary

### Backend API (Port 8000 - FastAPI)

| Endpoint | Method | Purpose | Status Tracking |
|----------|--------|---------|-----------------|
| `/analyze-repo` | POST | Analyze PHP repository | Sets status to `analyzing` → `analyzed` |
| `/migrationplan` | POST | Generate migration plan | Sets status to `planning` → `planned` |
| `/migrate-code` | POST | Execute code migration | Sets status to `migrating` → `completed` (phase 3) |
| `/projects/user/{user_id}` | GET | Get all user projects | Read-only |
| `/projects/user/{user_id}/status/{status}` | GET | Filter by status | Read-only |
| `/projects/{project_id}` | GET | Get project details | Read-only |

## Status Flow

```
analyzing → analyzed → planning → planned → migrating → completed
                                                       ↓
                                                    failed
```

## Progress Mapping

| Status | Progress % |
|--------|-----------|
| analyzing | 10% |
| analyzed | 25% |
| planning | 40% |
| planned | 55% |
| migrating | 75% |
| completed | 100% |
| failed | 0% |

## Error Handling

All backend API calls automatically track errors:

```typescript
try {
  await backendService.analyzeRepository({...});
} catch (error) {
  // Firebase automatically stores:
  // - error message in project.error
  // - error timestamp in project.error_timestamp
  // - status changes to 'failed'
  console.error('Operation failed:', error);
}
```

## Best Practices

1. **Always Check Authentication**
   ```typescript
   const user = auth.currentUser;
   if (!user) throw new Error('Not authenticated');
   ```

2. **Use Project ID from Response**
   ```typescript
   const response = await backendService.analyzeRepository({...});
   const projectId = response.project_id; // Use this for subsequent calls
   ```

3. **Monitor Status Changes**
   ```typescript
   // Poll for status updates or use Firebase listeners
   const project = await backendService.getProjectDetails(projectId);
   if (project.status === 'completed') {
     // Enable download
   }
   ```

4. **Handle Errors Gracefully**
   ```typescript
   if (project.status === 'failed' && project.error) {
     console.error('Migration failed:', project.error);
     // Show retry option
   }
   ```

5. **Display Progress to Users**
   ```typescript
   const progress = backendService.getProgressPercentage(project.status);
   const nextStep = backendService.getNextStep(project.status);
   // Show both in UI
   ```

## Environment Configuration

Ensure `.env` file has:
```env
# Backend API URL (Python/FastAPI for analysis & conversion)
VITE_BACKEND_API_URL=http://127.0.0.1:8000
```

## Testing

1. Start FastAPI backend on port 8000
2. Ensure Firebase is configured
3. Test each endpoint:
   ```bash
   curl -X POST http://127.0.0.1:8000/analyze-repo \
     -H "Content-Type: application/json" \
     -d '{"user_id":"test-user","repo_url":"https://github.com/owner/repo"}'
   ```

## Summary

✅ **Applied Changes:**
- Enhanced project types with 7 status states
- Created backend service for FastAPI integration
- Updated ProjectCard with status tracking
- Added status filtering to Projects list
- Helper methods for progress and styling
- Comprehensive error tracking
- Timestamp management (created, updated, completed)

All changes are client-side only (no server modifications required).
