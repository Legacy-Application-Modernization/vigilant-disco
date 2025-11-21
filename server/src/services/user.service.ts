import FirebaseConfig from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';

export type UserRole = 'admin' | 'manager' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
  };
  plan?: 'free' | 'pro' | 'enterprise';
  usage?: {
    projectsCreated: number;
    lastActive: Date;
  };
}

export interface UpdateUserData {
  displayName?: string;
  photoURL?: string;
  preferences?: Partial<UserProfile['preferences']>;
}

class UserService {
  private usersCollection = 'users';

  // Lazy initialization - get firestore when needed
  private getFirestore() {
    const firebase = FirebaseConfig.getInstance();
    return firebase.getFirestore();
  }

  async createUser(uid: string, userData: Partial<UserProfile>): Promise<UserProfile> {
    const now = new Date();
    const userProfile: UserProfile = {
      uid,
      email: userData.email || '',
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      role: userData.role || 'user', // Default role is 'user'
      createdAt: now,
      updatedAt: now,
      plan: 'free',
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en',
        ...userData.preferences
      },
      usage: {
        projectsCreated: 0,
        lastActive: now
      }
    };

    await this.getFirestore()
      .collection(this.usersCollection)
      .doc(uid)
      .set(userProfile);

    return userProfile;
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const doc = await this.getFirestore()
      .collection(this.usersCollection)
      .doc(uid)
      .get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return {
      ...data,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
      usage: {
        ...data?.usage,
        lastActive: data?.usage?.lastActive?.toDate() || new Date()
      }
    } as UserProfile;
  }

  async updateUserProfile(uid: string, updateData: UpdateUserData): Promise<UserProfile> {
    const updatePayload: any = {
      ...updateData,
      updatedAt: FieldValue.serverTimestamp()
    };

    if (updateData.preferences) {
      updatePayload.preferences = updateData.preferences;
    }

    await this.getFirestore()
      .collection(this.usersCollection)
      .doc(uid)
      .update(updatePayload);

    const updatedProfile = await this.getUserProfile(uid);
    if (!updatedProfile) {
      throw new Error('Failed to retrieve updated profile');
    }

    return updatedProfile;
  }

  async updateUserRole(uid: string, role: UserRole): Promise<UserProfile> {
    if (!['admin', 'manager', 'user'].includes(role)) {
      throw new Error('Invalid role. Must be: admin, manager, or user');
    }

    await this.getFirestore()
      .collection(this.usersCollection)
      .doc(uid)
      .update({
        role,
        updatedAt: FieldValue.serverTimestamp()
      });

    const updatedProfile = await this.getUserProfile(uid);
    if (!updatedProfile) {
      throw new Error('Failed to retrieve updated profile');
    }

    return updatedProfile;
  }

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    const snapshot = await this.getFirestore()
      .collection(this.usersCollection)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      uid: doc.id,
      email: data?.email || '',
      displayName: data?.displayName,
      photoURL: data?.photoURL,
      role: data?.role || 'user',
      plan: data?.plan || 'free',
      preferences: data?.preferences,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
      usage: {
        ...data?.usage,
        lastActive: data?.usage?.lastActive?.toDate() || new Date()
      }
    } as UserProfile;
  }

  async updateLastActive(uid: string): Promise<void> {
    await this.getFirestore()
      .collection(this.usersCollection)
      .doc(uid)
      .update({
        'usage.lastActive': FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
  }

  async incrementUsage(uid: string, field: 'projectsCreated'): Promise<void> {
    await this.getFirestore()
      .collection(this.usersCollection)
      .doc(uid)
      .update({
        [`usage.${field}`]: FieldValue.increment(1),
        'usage.lastActive': FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
  }

  async deleteUser(uid: string): Promise<void> {
    await this.getFirestore()
      .collection(this.usersCollection)
      .doc(uid)
      .delete();
  }

  async canCreateProject(uid: string): Promise<{ canCreate: boolean; reason?: string; currentCount?: number; maxAllowed?: number }> {
    const userProfile = await this.getUserProfile(uid);

    if (!userProfile) {
      return { canCreate: false, reason: 'User profile not found' };
    }

    // Admin and Manager roles have unlimited project creation
    if (userProfile.role === 'admin' || userProfile.role === 'manager') {
      return { canCreate: true, currentCount: userProfile.usage?.projectsCreated || 0 };
    }

    // Regular users are limited to 2 projects
    const PROJECT_LIMIT = 2;
    const currentCount = userProfile.usage?.projectsCreated || 0;

    if (currentCount >= PROJECT_LIMIT) {
      return {
        canCreate: false,
        reason: `You have reached the maximum limit of ${PROJECT_LIMIT} projects. Please contact support for additional access.`,
        currentCount,
        maxAllowed: PROJECT_LIMIT
      };
    }

    return {
      canCreate: true,
      currentCount,
      maxAllowed: PROJECT_LIMIT
    };
  }

  async getProjectLimitInfo(uid: string): Promise<{ currentCount: number; maxAllowed: number | null; role: UserRole }> {
    const userProfile = await this.getUserProfile(uid);

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    const currentCount = userProfile.usage?.projectsCreated || 0;
    const maxAllowed = (userProfile.role === 'admin' || userProfile.role === 'manager') ? null : 2;

    return {
      currentCount,
      maxAllowed,
      role: userProfile.role
    };
  }
}

export default UserService;