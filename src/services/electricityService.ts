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
import { ElectricityRoom, ElectricityBill } from '../types';
import { INITIAL_ELECTRICITY_ROOMS, INITIAL_ELECTRICITY_BILLS } from '../data/mockElectricityData';

const ELEC_ROOMS_COLLECTION = 'electricity_rooms';
const ELEC_BILLS_COLLECTION = 'electricity_bills';

// Sync initial seed data for electricity management to Firestore
export async function syncElectricityDataToFirestore() {
  try {
    const roomsSnap = await getDocs(collection(db, ELEC_ROOMS_COLLECTION));
    if (roomsSnap.empty) {
      for (const room of INITIAL_ELECTRICITY_ROOMS) {
        await setDoc(doc(db, ELEC_ROOMS_COLLECTION, room.id), room);
      }
    }

    const billsSnap = await getDocs(collection(db, ELEC_BILLS_COLLECTION));
    if (billsSnap.empty) {
      for (const bill of INITIAL_ELECTRICITY_BILLS) {
        await setDoc(doc(db, ELEC_BILLS_COLLECTION, bill.id), bill);
      }
    }
  } catch (error) {
    console.warn('Firestore initial electricity sync warning (using local fallback):', error);
  }
}

// Subscribe to electricity rooms
export function subscribeToElectricityRooms(onData: (rooms: ElectricityRoom[]) => void) {
  try {
    return onSnapshot(
      collection(db, ELEC_ROOMS_COLLECTION),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ElectricityRoom[] = snapshot.docs.map(doc => doc.data() as ElectricityRoom);
          list.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, 'en', { numeric: true }));
          onData(list);
        } else {
          onData(INITIAL_ELECTRICITY_ROOMS);
        }
      },
      (error) => {
        console.warn('Firestore snapshot error for electricity rooms:', error);
        onData(INITIAL_ELECTRICITY_ROOMS);
      }
    );
  } catch (error) {
    onData(INITIAL_ELECTRICITY_ROOMS);
    return () => {};
  }
}

// Subscribe to electricity bills
export function subscribeToElectricityBills(onData: (bills: ElectricityBill[]) => void) {
  try {
    return onSnapshot(
      collection(db, ELEC_BILLS_COLLECTION),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ElectricityBill[] = snapshot.docs.map(doc => doc.data() as ElectricityBill);
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onData(list);
        } else {
          onData(INITIAL_ELECTRICITY_BILLS);
        }
      },
      (error) => {
        console.warn('Firestore snapshot error for electricity bills:', error);
        onData(INITIAL_ELECTRICITY_BILLS);
      }
    );
  } catch (error) {
    onData(INITIAL_ELECTRICITY_BILLS);
    return () => {};
  }
}

// Electricity Room CRUD
export async function addElectricityRoomToFirestore(room: ElectricityRoom) {
  try {
    await setDoc(doc(db, ELEC_ROOMS_COLLECTION, room.id), room);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `/${ELEC_ROOMS_COLLECTION}/${room.id}`);
  }
}

export async function updateElectricityRoomInFirestore(roomId: string, data: Partial<ElectricityRoom>) {
  try {
    await setDoc(doc(db, ELEC_ROOMS_COLLECTION, roomId), data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `/${ELEC_ROOMS_COLLECTION}/${roomId}`);
  }
}

export async function deleteElectricityRoomFromFirestore(roomId: string) {
  try {
    await deleteDoc(doc(db, ELEC_ROOMS_COLLECTION, roomId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `/${ELEC_ROOMS_COLLECTION}/${roomId}`);
  }
}

// Electricity Bill CRUD & Payment updates
export async function addElectricityBillToFirestore(bill: ElectricityBill) {
  try {
    await setDoc(doc(db, ELEC_BILLS_COLLECTION, bill.id), bill);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `/${ELEC_BILLS_COLLECTION}/${bill.id}`);
  }
}

export async function updateElectricityBillInFirestore(billId: string, data: Partial<ElectricityBill>) {
  try {
    await setDoc(doc(db, ELEC_BILLS_COLLECTION, billId), data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `/${ELEC_BILLS_COLLECTION}/${billId}`);
  }
}

export async function deleteElectricityBillFromFirestore(billId: string) {
  try {
    await deleteDoc(doc(db, ELEC_BILLS_COLLECTION, billId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `/${ELEC_BILLS_COLLECTION}/${billId}`);
  }
}
