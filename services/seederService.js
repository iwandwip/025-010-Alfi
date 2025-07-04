import { 
  collection, 
  getDocs, 
  query, 
  where
} from 'firebase/firestore';
import { db } from './firebase';
import { signUpWithEmail } from './authService';
import { checkEmailExists } from './authService';

class SeederService {
  constructor() {
    this.namaWargaList = [
      'Ahmad Fauzi', 'Siti Aisyah', 'Muhammad Rizki', 'Fatimah Zahra', 'Ali Hassan',
      'Khadijah Nur', 'Umar Faruq', 'Zainab Salma', 'Yusuf Ibrahim', 'Maryam Sari',
      'Khalid Rahman', 'Aisha Dewi', 'Ibrahim Malik', 'Hafsa Putri', 'Salman Hakim',
      'Ruqayyah Indah', 'Hamza Wijaya', 'Sumayyah Lestari', 'Bilal Pratama', 'Ummu Kulthum',
      'Abdullah Surya', 'Safiyyah Wati', 'Uthman Bagus', 'Juwayriyah Sari', 'Mu\'adh Ramdan',
      'Zulaikha Fitri', 'Sa\'ad Permana', 'Rabiah Cantika', 'Zayd Pratomo', 'Ummu Salamah'
    ];

    this.alamatList = [
      'Jl. Merdeka No. 12, Malang', 'Jl. Sukarno Hatta No. 45, Malang', 'Jl. Ijen No. 23, Malang', 'Jl. Gajayana No. 67, Malang', 'Jl. Veteran No. 89, Malang',
      'Jl. Semarang No. 34, Malang', 'Jl. Jakarta No. 56, Malang', 'Jl. Bandung No. 78, Malang', 'Jl. Yogyakarta No. 90, Malang', 'Jl. Solo No. 21, Malang',
      'Jl. Brawijaya No. 43, Malang', 'Jl. Dieng No. 65, Malang', 'Jl. Kawi No. 87, Malang', 'Jl. Kelud No. 32, Malang', 'Jl. Semeru No. 54, Malang',
      'Jl. Arjuno No. 76, Malang', 'Jl. Panderman No. 98, Malang', 'Jl. Bromo No. 10, Malang', 'Jl. Raya Tlogomas No. 33, Malang', 'Jl. Sukun No. 55, Malang',
      'Jl. Blimbing No. 77, Malang', 'Jl. Lowokwaru No. 99, Malang', 'Jl. Klojen No. 11, Malang', 'Jl. Kedungkandang No. 22, Malang', 'Jl. Pakis No. 44, Malang',
      'Jl. Wagir No. 66, Malang', 'Jl. Singosari No. 88, Malang', 'Jl. Batu No. 13, Malang', 'Jl. Karangploso No. 35, Malang', 'Jl. Dau No. 57, Malang'
    ];
  }

  generateRandomRFID() {
    const chars = '0123456789ABCDEF';
    let rfid = '';
    for (let i = 0; i < 8; i++) {
      rfid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return rfid;
  }

  generateRandomPhone() {
    const prefixes = ['0812', '0813', '0821', '0822', '0823', '0851', '0852', '0853'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(Math.random() * 90000000) + 10000000;
    return `${prefix}${suffix}`;
  }

  getRandomName(nameList) {
    return nameList[Math.floor(Math.random() * nameList.length)];
  }

  async getHighestUserNumber() {
    try {
      if (!db) {
        return 0;
      }

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'user'));
      const querySnapshot = await getDocs(q);
      
      let highestNumber = 0;
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.email) {
          const match = userData.email.match(/^user(\d+)@gmail\.com$/);
          if (match) {
            const number = parseInt(match[1]);
            if (number > highestNumber) {
              highestNumber = number;
            }
          }
        }
      });
      
      return highestNumber;
    } catch (error) {
      console.error('Error getting highest user number:', error);
      return 0;
    }
  }

  async generateUniqueEmail() {
    try {
      const startNumber = (await this.getHighestUserNumber()) + 1;
      const maxRetries = 1000;
      
      for (let i = 0; i < maxRetries; i++) {
        const userNumber = startNumber + i;
        const email = `user${userNumber}@gmail.com`;
        
        try {
          const emailCheck = await checkEmailExists(email);
          
          if (emailCheck.success && !emailCheck.exists) {
            return { success: true, email: email, userNumber: userNumber };
          }
          
          if (!emailCheck.success) {
            console.warn(`Error checking email ${email}:`, emailCheck.error);
          }
          
        } catch (error) {
          console.warn(`Error checking email ${email}:`, error);
        }
      }
      
      return { 
        success: false, 
        error: `Tidak dapat menemukan email unik setelah ${maxRetries} percobaan dari user${startNumber}@gmail.com`
      };
    } catch (error) {
      console.error('Error in generateUniqueEmail:', error);
      return { 
        success: false, 
        error: `Error generating unique email: ${error.message}`
      };
    }
  }

  async createSeederUsers(count = 3) {
    try {
      const results = [];
      const errors = [];

      for (let i = 0; i < count; i++) {
        try {
          const emailResult = await this.generateUniqueEmail();
          
          if (!emailResult.success) {
            errors.push({
              index: i + 1,
              error: emailResult.error
            });
            continue;
          }

          const email = emailResult.email;
          const password = 'admin123';
          
          const profileData = {
            namaWarga: this.getRandomName(this.namaWargaList),
            alamat: this.getRandomName(this.alamatList),
            noHpWarga: this.generateRandomPhone(),
            rfidWarga: this.generateRandomRFID(),
            role: 'user'
          };

          const result = await signUpWithEmail(email, password, profileData);
          
          if (result.success) {
            results.push({
              email,
              userNumber: emailResult.userNumber,
              namaWarga: profileData.namaWarga,
              alamat: profileData.alamat,
              rfidWarga: profileData.rfidWarga,
              noHpWarga: profileData.noHpWarga
            });
          } else {
            errors.push({
              email,
              userNumber: emailResult.userNumber,
              error: result.error
            });
          }
        } catch (error) {
          errors.push({
            index: i + 1,
            error: error.message
          });
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return {
        success: true,
        created: results,
        errors: errors,
        totalCreated: results.length,
        totalErrors: errors.length
      };

    } catch (error) {
      console.error('Error in createSeederUsers:', error);
      return {
        success: false,
        error: error.message,
        created: [],
        errors: [],
        totalCreated: 0,
        totalErrors: 0
      };
    }
  }

  async getSeederStats() {
    try {
      if (!db) {
        return { total: 0, seederUsers: 0, highestUserNumber: 0, nextUserNumber: 1 };
      }

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'user'));

      const querySnapshot = await getDocs(q);
      
      let totalUsers = 0;
      let seederUsers = 0;
      let highestUserNumber = 0;

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        totalUsers++;
        
        if (userData.email && userData.email.match(/^user\d+@gmail\.com$/)) {
          seederUsers++;
          
          const match = userData.email.match(/^user(\d+)@gmail\.com$/);
          if (match) {
            const number = parseInt(match[1]);
            if (number > highestUserNumber) {
              highestUserNumber = number;
            }
          }
        }
      });

      return {
        total: totalUsers,
        seederUsers: seederUsers,
        highestUserNumber: highestUserNumber,
        nextUserNumber: highestUserNumber + 1
      };
    } catch (error) {
      console.error('Error getting seeder stats:', error);
      return { 
        total: 0, 
        seederUsers: 0, 
        highestUserNumber: 0, 
        nextUserNumber: 1 
      };
    }
  }
}

export const seederService = new SeederService();