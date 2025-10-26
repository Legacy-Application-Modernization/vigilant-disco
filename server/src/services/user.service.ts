import FirebaseConfig from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
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
}

export default UserService;