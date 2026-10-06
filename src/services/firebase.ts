import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  query,
  limit
} from 'firebase/firestore';
import { GenealogyTree, Member, MemoryPost, NotificationItem, UserProfile } from '../types';

// Cấu hình kết nối Firebase Firestore
// Ưu tiên đọc từ import.meta.env (khi thiết lập trên Netlify/Vite), tự động fallback về cấu hình mặc định
const env = (import.meta as any).env || {};

export const firebaseConfig = {
  projectId: env.VITE_FIREBASE_PROJECT_ID || "planar-alchemy-g6ppv",
  appId: env.VITE_FIREBASE_APP_ID || "1:606829565893:web:067170757e03c0556e1dac",
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyCGSU27c97uIPqD74QA0ngraNqJp3JuaoE",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "planar-alchemy-g6ppv.firebaseapp.com",
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || "ai-studio-cingungiaphknimg-987b1f6d-8648-4cd2-aa16-aa27584fc3ad",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "planar-alchemy-g6ppv.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "606829565893",
};

// Khởi tạo Firebase App & Firestore với DatabaseId riêng và cấu hình ignoreUndefinedProperties
export const app = initializeApp(firebaseConfig);

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
  }, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}
export const db = firestoreInstance;

/**
 * Làm sạch dữ liệu trước khi gửi lên Firestore:
 * - Chuyển toàn bộ undefined thành chuỗi rỗng '' hoặc null để Firestore không từ chối document
 * - Đảm bảo dữ liệu mảng, object luôn hợp lệ
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) return '' as unknown as T;
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean as T;
}

// Collection Names
export const COLLECTIONS = {
  TREES: 'trees',
  MEMBERS: 'members',
  MEMORIES: 'memories',
  NOTIFICATIONS: 'notifications',
  USERS: 'users',
} as const;

// 1. Tự động kiểm tra và khởi tạo dữ liệu mẫu lần đầu (Seed initial data if database is empty)
export async function seedInitialDataIfEmpty(
  initialTree: GenealogyTree,
  initialMembers: Member[],
  initialMemories: MemoryPost[],
  initialNotifications: NotificationItem[],
  initialUser: UserProfile
) {
  try {
    const membersRef = collection(db, COLLECTIONS.MEMBERS);
    const q = query(membersRef, limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('Database Firestore trống. Đang tự động lưu dữ liệu gia phả ban đầu lên Cloud...');
      
      // Lưu Tree
      await setDoc(doc(db, COLLECTIONS.TREES, initialTree.id), sanitizeForFirestore(initialTree));

      // Lưu User
      await setDoc(doc(db, COLLECTIONS.USERS, initialUser.id), sanitizeForFirestore(initialUser));

      // Lưu Members bằng Batch
      const batch = writeBatch(db);
      for (const m of initialMembers) {
        const mRef = doc(db, COLLECTIONS.MEMBERS, m.id);
        batch.set(mRef, sanitizeForFirestore(m));
      }
      for (const memo of initialMemories) {
        const memoRef = doc(db, COLLECTIONS.MEMORIES, memo.id);
        batch.set(memoRef, sanitizeForFirestore(memo));
      }
      for (const notif of initialNotifications) {
        const notifRef = doc(db, COLLECTIONS.NOTIFICATIONS, notif.id);
        batch.set(notifRef, sanitizeForFirestore(notif));
      }
      await batch.commit();
      console.log('Đã nạp toàn bộ gia phả vào Cloud Database Firestore thành công!');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Lỗi khi kiểm tra/khởi tạo dữ liệu mẫu Firestore:', error);
    return false;
  }
}

// 2. Lắng nghe thay đổi dữ liệu thời gian thực (Real-time Listeners)
export function subscribeToTree(treeId: string, onUpdate: (tree: GenealogyTree) => void) {
  const treeRef = doc(db, COLLECTIONS.TREES, treeId);
  return onSnapshot(treeRef, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data() as GenealogyTree);
    }
  }, (err) => {
    console.warn('Lỗi đồng bộ Tree từ Firestore:', err);
  });
}

export function subscribeToMembers(onUpdate: (members: Member[]) => void) {
  const membersRef = collection(db, COLLECTIONS.MEMBERS);
  return onSnapshot(membersRef, (snap) => {
    if (!snap.empty) {
      const list: Member[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as Member);
      });
      // Sắp xếp theo đời và id
      list.sort((a, b) => a.generation - b.generation);
      onUpdate(list);
    }
  }, (err) => {
    console.warn('Lỗi đồng bộ Members từ Firestore:', err);
  });
}

export function subscribeToMemories(onUpdate: (memories: MemoryPost[]) => void) {
  const memoriesRef = collection(db, COLLECTIONS.MEMORIES);
  return onSnapshot(memoriesRef, (snap) => {
    if (!snap.empty) {
      const list: MemoryPost[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as MemoryPost);
      });
      list.sort((a, b) => ((b.date || '') > (a.date || '') ? 1 : -1));
      onUpdate(list);
    }
  }, (err) => {
    console.warn('Lỗi đồng bộ Memories từ Firestore:', err);
  });
}

export function subscribeToNotifications(onUpdate: (notifications: NotificationItem[]) => void) {
  const notifRef = collection(db, COLLECTIONS.NOTIFICATIONS);
  return onSnapshot(notifRef, (snap) => {
    if (!snap.empty) {
      const list: NotificationItem[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as NotificationItem);
      });
      onUpdate(list);
    }
  }, (err) => {
    console.warn('Lỗi đồng bộ Notifications từ Firestore:', err);
  });
}

export function subscribeToUserProfile(userId: string, onUpdate: (user: UserProfile) => void) {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  return onSnapshot(userRef, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data() as UserProfile);
    }
  }, (err) => {
    console.warn('Lỗi đồng bộ User từ Firestore:', err);
  });
}

// 3. Các hàm ghi / cập nhật dữ liệu trực tiếp lên Firestore
export async function syncSaveTree(tree: GenealogyTree): Promise<void> {
  try {
    const clean = sanitizeForFirestore(tree);
    await setDoc(doc(db, COLLECTIONS.TREES, tree.id), clean, { merge: true });
  } catch (err) {
    console.error('Lỗi khi lưu Tree lên Firestore:', err);
    throw err;
  }
}

export async function syncSaveMember(member: Member): Promise<void> {
  try {
    const clean = sanitizeForFirestore(member);
    await setDoc(doc(db, COLLECTIONS.MEMBERS, member.id), clean, { merge: true });
  } catch (err) {
    console.error('Lỗi khi lưu Member lên Firestore:', err);
    throw err;
  }
}

export async function syncDeleteMember(memberId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.MEMBERS, memberId));
  } catch (err) {
    console.error('Lỗi khi xóa Member trên Firestore:', err);
    throw err;
  }
}

export async function syncBatchSaveMembers(members: Member[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const m of members) {
      const ref = doc(db, COLLECTIONS.MEMBERS, m.id);
      batch.set(ref, sanitizeForFirestore(m), { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.error('Lỗi khi lưu hàng loạt thành viên lên Firestore:', err);
    throw err;
  }
}

export async function syncSaveMemory(memory: MemoryPost): Promise<void> {
  try {
    const clean = sanitizeForFirestore(memory);
    await setDoc(doc(db, COLLECTIONS.MEMORIES, memory.id), clean, { merge: true });
    console.log(`[Firestore] Đã lưu bài viết kỷ niệm thành công: ${memory.id}`);
  } catch (err) {
    console.error('Lỗi khi lưu Kỷ niệm lên Firestore:', err);
    throw err;
  }
}

export async function syncDeleteMemory(memoryId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.MEMORIES, memoryId));
  } catch (err) {
    console.error('Lỗi khi xóa Kỷ niệm trên Firestore:', err);
    throw err;
  }
}

export async function syncSaveNotification(notification: NotificationItem): Promise<void> {
  try {
    const clean = sanitizeForFirestore(notification);
    await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notification.id), clean, { merge: true });
  } catch (err) {
    console.error('Lỗi khi lưu Thông báo lên Firestore:', err);
    throw err;
  }
}

export async function syncSaveUserProfile(user: UserProfile): Promise<void> {
  try {
    const clean = sanitizeForFirestore(user);
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), clean, { merge: true });
  } catch (err) {
    console.error('Lỗi khi lưu Hồ sơ người dùng lên Firestore:', err);
    throw err;
  }
}
