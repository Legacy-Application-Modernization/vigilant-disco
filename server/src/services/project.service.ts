import FirebaseConfig from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import UserService from './user.service';

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
  metadata?: {
    estimatedComplexity: 'low' | 'medium' | 'high';
    notes?: string;
    tags?: string[];
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
  settings?: Partial<ProjectSettings>;
  tags?: string[];
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  targetLanguage?: string;
  settings?: Partial<ProjectSettings>;
  metadata?: Partial<Project['metadata']>;
}

class ProjectService {
  private projectsCollection = 'projects';
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
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

    const project: Project = {
      id: projectId,
      userId,
      name: projectData.name,
      description: projectData.description,
      status: 'draft',
      sourceLanguage: projectData.sourceLanguage,
      targetLanguage: projectData.targetLanguage,
      createdAt: now,
      updatedAt: now,
      settings: defaultSettings,
      metadata: {
        estimatedComplexity: 'low',
        tags: projectData.tags || []
      }
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
    
    if (userId && data?.userId !== userId) {
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

    return updatedProject;
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

    await this.getFirestore()
      .collection(this.projectsCollection)
      .doc(projectId)
      .update({
        status,
        updatedAt: FieldValue.serverTimestamp()
      });
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
    return {
      ...project,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };
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