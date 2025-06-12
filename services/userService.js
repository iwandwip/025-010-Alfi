import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from './firebase';

export const createUserProfile = async (uid, profileData) => {
  try {
    if (!db) {
      console.warn('Firestore belum diinisialisasi, skip pembuatan profil');
      return { 
        success: true, 
        profile: { 
          id: uid, 
          ...profileData,
          createdAt: new Date(),
          updatedAt: new Date()
        } 
      };
    }

    const userProfile = {
      id: uid,
      email: profileData.email,
      role: profileData.role,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (profileData.role === 'admin') {
      userProfile.nama = profileData.nama;
      userProfile.noHp = profileData.noHp;
    } else if (profileData.role === 'user') {
      userProfile.namaSantri = profileData.namaSantri;
      userProfile.namaWali = profileData.namaWali;
      userProfile.noHpWali = profileData.noHpWali;
      userProfile.rfidSantri = profileData.rfidSantri || "";
    }

    await setDoc(doc(db, 'users', uid), userProfile);
    console.log('Profil user berhasil dibuat');
    return { success: true, profile: userProfile };
  } catch (error) {
    console.error('Error membuat profil user:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (uid) => {
  try {
    if (!db) {
      console.warn('Firestore belum diinisialisasi, return fallback profil');
      return { 
        success: false, 
        error: 'Firestore tidak tersedia' 
      };
    }

    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const profile = docSnap.data();
      
      if (profile.deleted) {
        return { success: false, error: 'User telah dihapus' };
      }
      
      return { success: true, profile };
    } else {
      return { success: false, error: 'Profil user tidak ditemukan' };
    }
  } catch (error) {
    console.error('Error mengambil profil user:', error);
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (uid, updates) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const updateData = { 
      ...updates,
      updatedAt: new Date()
    };

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updateData);

    console.log('Profil user berhasil diupdate');
    return { success: true };
  } catch (error) {
    console.error('Error update profil user:', error);
    return { success: false, error: error.message };
  }
};

export const getAllSantri = async () => {
  try {
    if (!db) {
      console.warn('Firestore belum diinisialisasi, return empty array');
      return { success: true, data: [] };
    }

    const usersRef = collection(db, 'users');
    const q = query(
      usersRef, 
      where('role', '==', 'user'),
      where('deleted', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    const santriList = [];
    querySnapshot.forEach((doc) => {
      santriList.push({
        id: doc.id,
        ...doc.data()
      });
    });

    santriList.sort((a, b) => a.namaSantri.localeCompare(b.namaSantri));

    return { success: true, data: santriList };
  } catch (error) {
    console.error('Error mengambil data santri:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const updateSantriRFID = async (santriId, rfidCode) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const santriRef = doc(db, 'users', santriId);
    await updateDoc(santriRef, {
      rfidSantri: rfidCode,
      updatedAt: new Date()
    });

    console.log('RFID santri berhasil diupdate');
    return { success: true };
  } catch (error) {
    console.error('Error update RFID santri:', error);
    return { success: false, error: error.message };
  }
};

export const deleteSantriRFID = async (santriId) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const santriRef = doc(db, 'users', santriId);
    await updateDoc(santriRef, {
      rfidSantri: null,
      updatedAt: new Date()
    });

    console.log('RFID santri berhasil dihapus');
    return { success: true };
  } catch (error) {
    console.error('Error menghapus RFID santri:', error);
    return { success: false, error: error.message };
  }
};

export const deleteSantri = async (santriId) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const userRef = doc(db, 'users', santriId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('Data santri tidak ditemukan');
    }

    const userData = userDoc.data();
    
    if (userData.deleted) {
      throw new Error('Santri sudah dihapus sebelumnya');
    }

    await deleteDoc(userRef);

    console.log('Data santri berhasil dihapus dari Firestore');

    return { 
      success: true, 
      message: 'Data santri berhasil dihapus dari Firestore. Akun login tetap ada di sistem tapi tidak bisa digunakan.'
    };
  } catch (error) {
    console.error('Error menghapus santri:', error);
    return { success: false, error: error.message };
  }
};

export const restoreSantri = async (santriId) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const userRef = doc(db, 'users', santriId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('Data santri tidak ditemukan');
    }

    await updateDoc(userRef, {
      deleted: false,
      deletedAt: null,
      deletedBy: null,
      restoredAt: new Date(),
      restoredBy: 'admin',
      updatedAt: new Date()
    });

    console.log('Data santri berhasil dipulihkan');
    return { success: true };
  } catch (error) {
    console.error('Error memulihkan santri:', error);
    return { success: false, error: error.message };
  }
};

export const getDeletedSantri = async () => {
  try {
    if (!db) {
      return { success: true, data: [] };
    }

    const usersRef = collection(db, 'users');
    const q = query(
      usersRef, 
      where('role', '==', 'user'),
      where('deleted', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    const deletedSantriList = [];
    querySnapshot.forEach((doc) => {
      deletedSantriList.push({
        id: doc.id,
        ...doc.data()
      });
    });

    deletedSantriList.sort((a, b) => 
      new Date(b.deletedAt) - new Date(a.deletedAt)
    );

    return { success: true, data: deletedSantriList };
  } catch (error) {
    console.error('Error mengambil data santri terhapus:', error);
    return { success: false, error: error.message, data: [] };
  }
};