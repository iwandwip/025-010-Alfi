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
      userProfile.namaWarga = profileData.namaWarga;
      userProfile.noHpWarga = profileData.noHpWarga;
      userProfile.rfidWarga = profileData.rfidWarga || "";
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

export const getAllWarga = async () => {
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
    
    const wargaList = [];
    querySnapshot.forEach((doc) => {
      wargaList.push({
        id: doc.id,
        ...doc.data()
      });
    });

    wargaList.sort((a, b) => a.namaWarga.localeCompare(b.namaWarga));

    return { success: true, data: wargaList };
  } catch (error) {
    console.error('Error mengambil data warga:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const updateWargaRFID = async (wargaId, rfidCode) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const wargaRef = doc(db, 'users', wargaId);
    await updateDoc(wargaRef, {
      rfidWarga: rfidCode,
      updatedAt: new Date()
    });

    console.log('RFID warga berhasil diupdate');
    return { success: true };
  } catch (error) {
    console.error('Error update RFID warga:', error);
    return { success: false, error: error.message };
  }
};

export const deleteWargaRFID = async (wargaId) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const wargaRef = doc(db, 'users', wargaId);
    await updateDoc(wargaRef, {
      rfidWarga: null,
      updatedAt: new Date()
    });

    console.log('RFID warga berhasil dihapus');
    return { success: true };
  } catch (error) {
    console.error('Error menghapus RFID warga:', error);
    return { success: false, error: error.message };
  }
};

export const deleteWarga = async (wargaId) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const userRef = doc(db, 'users', wargaId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('Data warga tidak ditemukan');
    }

    const userData = userDoc.data();
    
    if (userData.deleted) {
      throw new Error('Warga sudah dihapus sebelumnya');
    }

    await deleteDoc(userRef);

    console.log('Data warga berhasil dihapus dari Firestore');

    return { 
      success: true, 
      message: 'Data warga berhasil dihapus dari Firestore. Akun login tetap ada di sistem tapi tidak bisa digunakan.'
    };
  } catch (error) {
    console.error('Error menghapus warga:', error);
    return { success: false, error: error.message };
  }
};

export const restoreWarga = async (wargaId) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const userRef = doc(db, 'users', wargaId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('Data warga tidak ditemukan');
    }

    await updateDoc(userRef, {
      deleted: false,
      deletedAt: null,
      deletedBy: null,
      restoredAt: new Date(),
      restoredBy: 'admin',
      updatedAt: new Date()
    });

    console.log('Data warga berhasil dipulihkan');
    return { success: true };
  } catch (error) {
    console.error('Error memulihkan warga:', error);
    return { success: false, error: error.message };
  }
};

export const getDeletedWarga = async () => {
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
    
    const deletedWargaList = [];
    querySnapshot.forEach((doc) => {
      deletedWargaList.push({
        id: doc.id,
        ...doc.data()
      });
    });

    deletedWargaList.sort((a, b) => 
      new Date(b.deletedAt) - new Date(a.deletedAt)
    );

    return { success: true, data: deletedWargaList };
  } catch (error) {
    console.error('Error mengambil data warga terhapus:', error);
    return { success: false, error: error.message, data: [] };
  }
};