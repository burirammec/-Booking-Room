import { 
  db, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  OperationType, 
  handleFirestoreError 
} from '../firebase';
import { UserProfile } from '../types';
import { INITIAL_USERS } from '../data/mockUserData';

const USERS_COLLECTION = 'users';

// Initialize default users in Firestore if empty
export async function syncInitialUsersToFirestore() {
  try {
    const usersSnap = await getDocs(collection(db, USERS_COLLECTION));
    if (usersSnap.empty) {
      for (const user of INITIAL_USERS) {
        await setDoc(doc(db, USERS_COLLECTION, user.uid), user);
      }
    }
  } catch (error) {
    console.warn('Firestore user sync warning (using local fallback):', error);
  }
}

// Real-time listener for Users
export function subscribeToUsers(onData: (users: UserProfile[]) => void) {
  try {
    return onSnapshot(
      collection(db, USERS_COLLECTION),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: UserProfile[] = snapshot.docs.map(doc => doc.data() as UserProfile);
          list.sort((a, b) => a.displayName.localeCompare(b.displayName, 'th'));
          onData(list);
        } else {
          onData(INITIAL_USERS);
        }
      },
      (error) => {
        console.warn('Firestore snapshot error for users:', error);
        onData(INITIAL_USERS);
      }
    );
  } catch (error) {
    onData(INITIAL_USERS);
    return () => {};
  }
}

// User CRUD Operations
export async function addUserToFirestore(user: UserProfile) {
  try {
    await setDoc(doc(db, USERS_COLLECTION, user.uid), user);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `/${USERS_COLLECTION}/${user.uid}`);
  }
}

export async function updateUserInFirestore(userId: string, userData: Partial<UserProfile>) {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      ...userData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `/${USERS_COLLECTION}/${userId}`);
  }
}

export async function deleteUserFromFirestore(userId: string) {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `/${USERS_COLLECTION}/${userId}`);
  }
}

// User Registration & Approval Workflow
export async function registerUserInFirestore(userData: Partial<UserProfile> & { uid: string; displayName: string; email: string }) {
  const newUser: UserProfile = {
    role: 'user',
    department: userData.department || 'ผู้ใช้งานทั่วไป',
    status: 'inactive',
    approvalStatus: 'pending',
    registeredAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...userData
  };
  try {
    await setDoc(doc(db, USERS_COLLECTION, newUser.uid), newUser);
    return newUser;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `/${USERS_COLLECTION}/${newUser.uid}`);
    return newUser;
  }
}

export async function approveUserInFirestore(userId: string, adminEmail: string, customData?: Partial<UserProfile>) {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      status: 'active',
      approvalStatus: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: adminEmail,
      rejectionReason: '',
      updatedAt: new Date().toISOString(),
      ...(customData || {})
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `/${USERS_COLLECTION}/${userId}`);
  }
}

export async function rejectUserInFirestore(userId: string, adminEmail: string, reason: string) {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      status: 'inactive',
      approvalStatus: 'rejected',
      approvedBy: adminEmail,
      rejectionReason: reason || 'ไม่ผ่านเกณฑ์การอนุมัติ กรุณาติดต่อเจ้าหน้าที่',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `/${USERS_COLLECTION}/${userId}`);
  }
}

