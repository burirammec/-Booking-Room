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
import { Booking, Room } from '../types';
import { INITIAL_ROOMS, INITIAL_BOOKINGS } from '../data/mockData';

const BOOKINGS_COLLECTION = 'bookings';
const ROOMS_COLLECTION = 'rooms';

// Initialize default rooms and bookings in Firestore if empty
export async function syncInitialDataToFirestore() {
  try {
    const roomsSnap = await getDocs(collection(db, ROOMS_COLLECTION));
    if (roomsSnap.empty) {
      for (const room of INITIAL_ROOMS) {
        await setDoc(doc(db, ROOMS_COLLECTION, room.id), room);
      }
    }

    const bookingsSnap = await getDocs(collection(db, BOOKINGS_COLLECTION));
    if (bookingsSnap.empty) {
      for (const booking of INITIAL_BOOKINGS) {
        await setDoc(doc(db, BOOKINGS_COLLECTION, booking.id), booking);
      }
    }
  } catch (error) {
    console.warn('Firestore initial sync warning (using local state fallback):', error);
  }
}

// Real-time listener for Rooms
export function subscribeToRooms(onData: (rooms: Room[]) => void) {
  try {
    return onSnapshot(
      collection(db, ROOMS_COLLECTION),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Room[] = snapshot.docs.map(doc => doc.data() as Room);
          list.sort((a, b) => a.name.localeCompare(b.name, 'th'));
          onData(list);
        } else {
          onData(INITIAL_ROOMS);
        }
      },
      (error) => {
        console.warn('Firestore snapshot error for rooms:', error);
        onData(INITIAL_ROOMS);
      }
    );
  } catch (error) {
    onData(INITIAL_ROOMS);
    return () => {};
  }
}

// Room CRUD Operations
export async function addRoomToFirestore(room: Room) {
  try {
    await setDoc(doc(db, ROOMS_COLLECTION, room.id), room);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `/${ROOMS_COLLECTION}/${room.id}`);
  }
}

export async function updateRoomInFirestore(roomId: string, roomData: Partial<Room>) {
  try {
    await updateDoc(doc(db, ROOMS_COLLECTION, roomId), roomData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `/${ROOMS_COLLECTION}/${roomId}`);
  }
}

export async function deleteRoomFromFirestore(roomId: string) {
  try {
    await deleteDoc(doc(db, ROOMS_COLLECTION, roomId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `/${ROOMS_COLLECTION}/${roomId}`);
  }
}

// Real-time listener for Bookings
export function subscribeToBookings(onData: (bookings: Booking[]) => void) {
  try {
    return onSnapshot(
      collection(db, BOOKINGS_COLLECTION),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Booking[] = snapshot.docs.map(doc => doc.data() as Booking);
          // Sort by date descending
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onData(list);
        } else {
          onData(INITIAL_BOOKINGS);
        }
      },
      (error) => {
        console.warn('Firestore snapshot error for bookings:', error);
        onData(INITIAL_BOOKINGS);
      }
    );
  } catch (error) {
    onData(INITIAL_BOOKINGS);
    return () => {};
  }
}

// Booking CRUD Operations
export async function addBookingToFirestore(booking: Booking) {
  try {
    await setDoc(doc(db, BOOKINGS_COLLECTION, booking.id), booking);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `/${BOOKINGS_COLLECTION}/${booking.id}`);
  }
}

export async function updateBookingInFirestore(bookingId: string, bookingData: Partial<Booking>) {
  try {
    await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
      ...bookingData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `/${BOOKINGS_COLLECTION}/${bookingId}`);
  }
}

export async function updateBookingStatusInFirestore(bookingId: string, status: Booking['status'], adminNote?: string) {
  try {
    await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
      status,
      adminNote: adminNote || '',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `/${BOOKINGS_COLLECTION}/${bookingId}`);
  }
}

export async function deleteBookingFromFirestore(bookingId: string) {
  try {
    await deleteDoc(doc(db, BOOKINGS_COLLECTION, bookingId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `/${BOOKINGS_COLLECTION}/${bookingId}`);
  }
}
