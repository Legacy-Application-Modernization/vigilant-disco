import { useState, useEffect } from 'react';
import backendService from '../services/backend.service';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchProjects = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await backendService.getUserProjects(currentUser.uid);
      console.log('📦 Projects Response:', response);
      console.log('📦 Response.projects:', response.projects);
      console.log('📦 Response type:', typeof response);
      
      if (response.success) {
        const projectList = response.projects || [];
        console.log('📦 Setting projects:', projectList);
        setProjects(projectList);
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array
        console.log('📦 Response is array, setting directly');
        setProjects(response);
      }
    } catch (err: any) {
      console.error('❌ Fetch projects error:', err);
      setError(err.userMessage || err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (_projectData: any) => {
    try {
      // Projects are created via analyze_repository in UploadFiles component
      // This is a placeholder for future direct project creation
      await fetchProjects(); // Refresh the list
    } catch (err: any) {
      throw new Error(err.userMessage || err.message || 'Failed to create project');
    }
  };

  const updateProject = async (_projectId: string, _updateData: any) => {
    try {
      // FastAPI backend doesn't have a generic update endpoint yet
      // Updates happen through specific endpoints (analyze, plan, migrate)
      await fetchProjects(); // Refresh the list
    } catch (err: any) {
      throw new Error(err.userMessage || err.message || 'Failed to update project');
    }
  };

  const deleteProject = async (_projectId: string) => {
    try {
      // Use Node.js backend (port 3001) for delete operation
      await apiService.deleteProject(_projectId);
      await fetchProjects(); // Refresh the list
    } catch (err: any) {
      throw new Error(err.userMessage || err.message || 'Failed to delete project');
    }
  };

  const updateProjectStatus = async (_projectId: string, _status: string) => {
    try {
      // Status updates happen automatically through FastAPI backend operations
      await fetchProjects(); // Refresh the list
    } catch (err: any) {
      throw new Error(err.userMessage || err.message || 'Failed to update project status');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentUser]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    updateProjectStatus
  };
};