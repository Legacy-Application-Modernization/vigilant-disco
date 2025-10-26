import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchProjects = async (params?: any) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUserProjects(params);
      if (response.success) {
        setProjects(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: any) => {
    try {
      const response = await apiService.createProject(projectData);
      if (response.success) {
        await fetchProjects(); // Refresh the list
        return response.data;
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create project');
    }
  };

  const updateProject = async (projectId: string, updateData: any) => {
    try {
      const response = await apiService.updateProject(projectId, updateData);
      if (response.success) {
        await fetchProjects(); // Refresh the list
        return response.data;
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update project');
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await apiService.deleteProject(projectId);
      await fetchProjects(); // Refresh the list
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const updateProjectStatus = async (projectId: string, status: string) => {
    try {
      await apiService.updateProjectStatus(projectId, status);
      await fetchProjects(); // Refresh the list
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update project status');
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