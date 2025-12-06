import FirebaseConfig from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import UserService from './user.service';
import EmailService from './email.service';

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'draft' | 'planning' | 'in-progress' | 'completed' | 'archived';
  sourceLanguage: string;
  targetLanguage?: string;
  createdAt: Date;
  updatedAt: Date;
  settings: ProjectSettings;
  owner?: string;
  repo?: string;
  metadata?: {
    estimatedComplexity?: 'low' | 'medium' | 'high';
    notes?: string;
    tags?: string[];
    repositoryUrl?: string;
    branch?: string;
    analysisResult?: any;
    conversionPlanner?: any;
    transformationData?: any;
    fileStructure?: any;
  };
}

export interface ProjectSettings {
  preserveComments: boolean;
  modernizePatterns: boolean;
  optimizeCode: boolean;
  addDocumentation: boolean;
  targetFramework?: string;
  conversionNotes?: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  sourceLanguage: string;
  targetLanguage?: string;
  status?: 'planning' | 'in-progress' | 'completed' | 'archived';
  settings?: Partial<ProjectSettings>;
  tags?: string[];
  owner?: string;
  repo?: string;
  metadata?: {
    repositoryUrl?: string;
    branch?: string;
    analysisResult?: any;
    conversionPlanner?: any;
    transformationData?: any;
    fileStructure?: any;
    estimatedComplexity?: 'low' | 'medium' | 'high';
    notes?: string;
    tags?: string[];
  };
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  targetLanguage?: string;
  settings?: Partial<ProjectSettings>;
  owner?: string;
  repo?: string;
  metadata?: Partial<Project['metadata']>;
}

class ProjectService {
  private projectsCollection = 'projects';
  private userService: UserService;
  private emailService: EmailService;

  constructor() {
    this.userService = new UserService();
    this.emailService = new EmailService();
  }

  // Lazy initialization - get firestore when needed
  private getFirestore() {
    const firebase = FirebaseConfig.getInstance();
    return firebase.getFirestore();
  }

  async createProject(userId: string, projectData: CreateProjectData): Promise<Project> {
    // Check if user can create a new project
    const limitCheck = await this.userService.canCreateProject(userId);
    if (!limitCheck.canCreate) {
      throw new Error(limitCheck.reason || 'Cannot create project');
    }

    const now = new Date();
    const projectId = this.getFirestore().collection(this.projectsCollection).doc().id;

    const defaultSettings: ProjectSettings = {
      preserveComments: true,
      modernizePatterns: true,
      optimizeCode: false,
      addDocumentation: true,
      ...projectData.settings
    };

    // Build metadata object, excluding undefined values
    const metadata: any = {
      estimatedComplexity: projectData.metadata?.estimatedComplexity || 'low',
      tags: projectData.tags || projectData.metadata?.tags || []
    };

    // Only add optional fields if they have values
    if (projectData.metadata?.repositoryUrl) metadata.repositoryUrl = projectData.metadata.repositoryUrl;
    if (projectData.metadata?.branch) metadata.branch = projectData.metadata.branch;
    if (projectData.metadata?.analysisResult) metadata.analysisResult = projectData.metadata.analysisResult;
    if (projectData.metadata?.conversionPlanner) metadata.conversionPlanner = projectData.metadata.conversionPlanner;
    if (projectData.metadata?.transformationData) metadata.transformationData = projectData.metadata.transformationData;
    if (projectData.metadata?.fileStructure) metadata.fileStructure = projectData.metadata.fileStructure;
    if (projectData.metadata?.notes) metadata.notes = projectData.metadata.notes;

    const project: Project = {
      id: projectId,
      userId,
      name: projectData.name,
      description: projectData.description,
      status: projectData.status || 'planning',
      sourceLanguage: projectData.sourceLanguage,
      targetLanguage: projectData.targetLanguage,
      createdAt: now,
      updatedAt: now,
      settings: defaultSettings,
      owner: projectData.owner,
      repo: projectData.repo,
      metadata
    };

    await this.getFirestore()
      .collection(this.projectsCollection)
      .doc(projectId)
      .set(this.serializeProject(project));

    await this.userService.incrementUsage(userId, 'projectsCreated');

    return project;
  }

  async getProject(projectId: string, userId?: string): Promise<Project | null> {
    const doc = await this.getFirestore()
      .collection(this.projectsCollection)
      .doc(projectId)
      .get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    
    // Check both userId (Node.js backend format) and user_id (FastAPI backend format)
    if (userId && data?.userId !== userId && data?.user_id !== userId) {
      return null;
    }

    return this.deserializeProject(data);
  }

  async getUserProjects(
    userId: string,
    limit: number = 20,
    startAfter?: string,
    status?: Project['status']
  ): Promise<{
    projects: Project[];
    hasMore: boolean;
    lastDoc?: string;
  }> {
    let query = this.getFirestore()
      .collection(this.projectsCollection)
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .limit(limit + 1);

    if (status) {
      query = query.where('status', '==', status);
    }

    if (startAfter) {
      const startAfterDoc = await this.getFirestore()
        .collection(this.projectsCollection)
        .doc(startAfter)
        .get();
      
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    const snapshot = await query.get();
    const projects: Project[] = [];
    
    snapshot.docs.forEach((doc, index) => {
      if (index < limit) {
        projects.push(this.deserializeProject(doc.data()));
      }
    });

    return {
      projects,
      hasMore: snapshot.docs.length > limit,
      lastDoc: projects.length > 0 ? projects[projects.length - 1].id : undefined
    };
  }

  async updateProject(projectId: string, userId: string, updateData: UpdateProjectData): Promise<Project> {
    const existingProject = await this.getProject(projectId, userId);
    if (!existingProject) {
      throw new Error('Project not found or access denied');
    }

    // Track if status is changing
    const statusChanged = updateData.settings?.conversionNotes !== undefined && 
                          existingProject.status !== updateData.settings.conversionNotes;
    const oldStatus = existingProject.status;

    const updatePayload: any = {
      ...updateData,
      updatedAt: FieldValue.serverTimestamp()
    };

    if (updateData.settings) {
      updatePayload.settings = {
        ...existingProject.settings,
        ...updateData.settings
      };
    }

    if (updateData.metadata) {
      updatePayload.metadata = {
        ...existingProject.metadata,
        ...updateData.metadata
      };
    }

    await this.getFirestore()
      .collection(this.projectsCollection)
      .doc(projectId)
      .update(updatePayload);

    const updatedProject = await this.getProject(projectId, userId);
    if (!updatedProject) {
      throw new Error('Failed to retrieve updated project');
    }

    // Send email notification if status changed to completed, failed, or in-progress
    if (updatedProject.status !== oldStatus) {
      this.sendStatusChangeNotification(userId, updatedProject, oldStatus).catch(err => {
        console.error('Failed to send status notification email:', err);
      });
    }

    return updatedProject;
  }

  private async sendStatusChangeNotification(
    userId: string, 
    project: Project, 
    oldStatus: string
  ): Promise<void> {
    try {
      // Get user details
      const user = await this.userService.getUserProfile(userId);
      if (!user || !user.email) {
        return;
      }

      // Only send notifications for significant status changes
      const notifiableStatuses = ['completed', 'archived', 'in-progress'];
      if (!notifiableStatuses.includes(project.status)) {
        return;
      }

      // Map status to notification type
      const emailStatus: 'completed' | 'in-progress' | 'failed' = 
        project.status === 'completed' ? 'completed' :
        project.status === 'archived' ? 'failed' :
        'in-progress';

      const statusDetails = this.getStatusDetails(project.status, oldStatus);

      await this.emailService.sendProjectStatusNotification(user.email, {
        userName: user.displayName || user.email.split('@')[0],
        projectName: project.name,
        status: emailStatus,
        projectUrl: `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/projects/${project.id}`,
        statusDetails,
      });
    } catch (error) {
      console.error('Error sending status change notification:', error);
      // Don't throw - email failures shouldn't block the update
    }
  }

  private getStatusDetails(newStatus: string, oldStatus: string): string {
    const statusMessages: Record<string, string> = {
      'completed': 'Your project has been successfully completed and is ready for download.',
      'in-progress': 'Your project is currently being processed. We\'ll notify you when it\'s complete.',
      'planning': 'Your project planning phase has started. We\'re analyzing your code structure.',
      'archived': 'Your project encountered an issue during processing. Please review the project details.',
      'draft': 'Your project has been saved as a draft.',
    };

    return statusMessages[newStatus] || `Project status changed from ${oldStatus} to ${newStatus}.`;
  }

  async deleteProject(projectId: string, userId: string): Promise<void> {
    const project = await this.getProject(projectId, userId);
    if (!project) {
      throw new Error('Project not found or access denied');
    }

    await this.getFirestore()
      .collection(this.projectsCollection)
      .doc(projectId)
      .delete();
  }

  async updateProjectStatus(projectId: string, userId: string, status: Project['status']): Promise<void> {
    const project = await this.getProject(projectId, userId);
    if (!project) {
      throw new Error('Project not found or access denied');
    }

    const oldStatus = project.status;

    await this.getFirestore()
      .collection(this.projectsCollection)
      .doc(projectId)
      .update({
        status,
        updatedAt: FieldValue.serverTimestamp()
      });

    // Send email notification if status changed
    if (status !== oldStatus) {
      const updatedProject = { ...project, status };
      this.sendStatusChangeNotification(userId, updatedProject, oldStatus).catch(err => {
        console.error('Failed to send status notification email:', err);
      });
    }
  }

  async addProjectNote(projectId: string, userId: string, note: string): Promise<void> {
    const project = await this.getProject(projectId, userId);
    if (!project) {
      throw new Error('Project not found or access denied');
    }

    await this.getFirestore()
      .collection(this.projectsCollection)
      .doc(projectId)
      .update({
        'metadata.notes': note,
        updatedAt: FieldValue.serverTimestamp()
      });
  }

  async getProjectsByTag(userId: string, tag: string): Promise<Project[]> {
    const snapshot = await this.getFirestore()
      .collection(this.projectsCollection)
      .where('userId', '==', userId)
      .where('metadata.tags', 'array-contains', tag)
      .orderBy('updatedAt', 'desc')
      .get();

    const projects: Project[] = [];
    snapshot.docs.forEach(doc => {
      projects.push(this.deserializeProject(doc.data()));
    });

    return projects;
  }

  private serializeProject(project: Project): any {
    const serialized: any = {
      ...project,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };

    // Remove undefined values to avoid Firestore errors
    this.removeUndefinedValues(serialized);
    
    return serialized;
  }

  private removeUndefinedValues(obj: any): void {
    Object.keys(obj).forEach(key => {
      if (obj[key] === undefined) {
        delete obj[key];
      } else if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
        this.removeUndefinedValues(obj[key]);
        // Remove empty objects
        if (Object.keys(obj[key]).length === 0) {
          delete obj[key];
        }
      }
    });
  }

  private deserializeProject(data: any): Project {
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }
}

export default ProjectService;