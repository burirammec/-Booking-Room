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
import { AttendanceRecord } from '../types';
import { INITIAL_ATTENDANCE } from '../data/mockAttendanceData';

const ATTENDANCE_COLLECTION = 'attendance_records';

// Initialize default attendance in Firestore if empty
export async function syncInitialAttendanceToFirestore() {
  try {
    const snap = await getDocs(collection(db, ATTENDANCE_COLLECTION));
    if (snap.empty) {
      for (const item of INITIAL_ATTENDANCE) {
        await setDoc(doc(db, ATTENDANCE_COLLECTION, item.id), item);
      }
    }
  } catch (error) {
    console.warn('Firestore attendance sync warning (using local fallback):', error);
  }
}

// Real-time listener for Attendance
export function subscribeToAttendance(onData: (records: AttendanceRecord[]) => void) {
  try {
    return onSnapshot(
      collection(db, ATTENDANCE_COLLECTION),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: AttendanceRecord[] = snapshot.docs.map(d => d.data() as AttendanceRecord);
          // Sort by date and check-in time descending (newest first)
          list.sort((a, b) => {
            const dateCmp = b.date.localeCompare(a.date);
            if (dateCmp !== 0) return dateCmp;
            return (b.checkInTime || '').localeCompare(a.checkInTime || '');
          });
          onData(list);
        } else {
          onData(INITIAL_ATTENDANCE);
        }
      },
      (error) => {
        console.warn('Firestore snapshot error for attendance:', error);
        onData(INITIAL_ATTENDANCE);
      }
    );
  } catch (error) {
    onData(INITIAL_ATTENDANCE);
    return () => {};
  }
}

// Attendance CRUD Operations
export async function addAttendanceToFirestore(record: AttendanceRecord) {
  try {
    await setDoc(doc(db, ATTENDANCE_COLLECTION, record.id), record);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `/${ATTENDANCE_COLLECTION}/${record.id}`);
  }
}

export async function updateAttendanceInFirestore(id: string, data: Partial<AttendanceRecord>) {
  try {
    await updateDoc(doc(db, ATTENDANCE_COLLECTION, id), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `/${ATTENDANCE_COLLECTION}/${id}`);
  }
}

export async function deleteAttendanceFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, ATTENDANCE_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `/${ATTENDANCE_COLLECTION}/${id}`);
  }
}
