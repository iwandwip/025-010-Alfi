import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  deleteUser,
} from 'firebase/auth';
import { auth } from './firebase';
import { createUserProfile, getUserProfile } from './userService';

const handleAuthError = (error) => {
  const errorMessages = {
    'auth/user-not-found': 'Email tidak terdaftar.',
    'auth/wrong-password': 'Password salah.',
    'auth/email-already-in-use': 'Email sudah terdaftar.',
    'auth/weak-password': 'Password minimal 6 karakter.',
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/network-request-failed': 'Periksa koneksi internet Anda.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
    'auth/user-disabled': 'Akun ini telah dinonaktifkan.',
    'auth/invalid-credential': 'Email atau password salah.',
    'auth/configuration-not-found': 'Konfigurasi Firebase error.',
  };
  return errorMessages[error.code] || `Error: ${error.message}`;
};

export const checkEmailExists = async (email) => {
  try {
    const apiKey = "AIzaSyDXKj-ZsNWqkwxvB7iYMgSzXKY1WmUkutw";
    
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: email,
        continueUri: 'http://localhost'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error?.message || 'Error checking email' };
    }

    const emailExists = data.registered === true;
    return { success: true, exists: emailExists };
  } catch (error) {
    console.error('Error checking email:', error);
    return { success: false, error: error.message };
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    if (!auth) {
      throw new Error('Firebase Auth belum diinisialisasi.');
    }
    
    console.log('Mencoba masuk dengan email:', email);
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    const profileResult = await getUserProfile(result.user.uid);
    if (!profileResult.success) {
      if (profileResult.error === 'User telah dihapus') {
        await signOut(auth);
        throw new Error('Akun Anda telah dinonaktifkan. Hubungi admin untuk informasi lebih lanjut.');
      }
      console.warn('Profile check failed:', profileResult.error);
    }
    
    console.log('Masuk berhasil');
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Error masuk:', error);
    return { success: false, error: handleAuthError(error) };
  }
};

export const signUpWithEmail = async (email, password, profileData) => {
  try {
    if (!auth) {
      throw new Error('Firebase Auth belum diinisialisasi.');
    }

    console.log('Mencoba membuat akun untuk:', email);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    const profilePayload = {
      email,
      ...profileData,
    };

    const profileResult = await createUserProfile(result.user.uid, profilePayload);

    if (!profileResult.success) {
      try {
        await deleteUser(result.user);
        console.log('User auth berhasil dihapus setelah gagal buat profil');
      } catch (deleteError) {
        console.error('Error menghapus user setelah gagal buat profil:', deleteError);
      }
      throw new Error(profileResult.error);
    }

    console.log('Akun berhasil dibuat');
    return { success: true, user: result.user, profile: profileResult.profile };
  } catch (error) {
    console.error('Error registrasi:', error);
    return { success: false, error: handleAuthError(error) };
  }
};

export const signOutUser = async () => {
  try {
    if (!auth) {
      throw new Error('Firebase Auth belum diinisialisasi');
    }
    await signOut(auth);
    console.log('Keluar berhasil');
    return { success: true };
  } catch (error) {
    console.error('Error keluar:', error);
    return { success: false, error: handleAuthError(error) };
  }
};

export const deleteUserAuth = async (user) => {
  try {
    if (!auth || !user) {
      throw new Error('Firebase Auth atau user tidak tersedia');
    }
    
    await deleteUser(user);
    console.log('User auth berhasil dihapus');
    return { success: true };
  } catch (error) {
    console.error('Error menghapus user auth:', error);
    return { success: false, error: handleAuthError(error) };
  }
};