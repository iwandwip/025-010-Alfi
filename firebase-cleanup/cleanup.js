const admin = require("firebase-admin");

let inquirer;
(async () => {
  inquirer = (await import('inquirer')).default;
})();

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const PROTECTED_EMAILS = [
  'bendahara@gmail.com',
  'admin@gmail.com'
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getAllAuthUsers() {
  const users = [];
  let nextPageToken;
  
  do {
    const listUsersResult = await auth.listUsers(1000, nextPageToken);
    users.push(...listUsersResult.users);
    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);
  
  return users;
}

async function getAllFirestoreUsers() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  
  const users = [];
  snapshot.forEach(doc => {
    users.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return users;
}

async function getAuthUsersToDelete() {
  const allUsers = await getAllAuthUsers();
  return allUsers.filter(user => 
    user.email && !PROTECTED_EMAILS.includes(user.email.toLowerCase())
  );
}

async function getFirestoreUsersToDelete() {
  const allUsers = await getAllFirestoreUsers();
  return allUsers.filter(user => 
    user.email && !PROTECTED_EMAILS.includes(user.email.toLowerCase())
  );
}

async function getPaymentData(timelineId) {
  const paymentsRef = db.collection('payments').doc(timelineId).collection('periods');
  const periodsSnapshot = await paymentsRef.get();
  
  const allPayments = [];
  
  for (const periodDoc of periodsSnapshot.docs) {
    const wargaPaymentsRef = periodDoc.ref.collection('warga_payments');
    const wargaSnapshot = await wargaPaymentsRef.get();
    
    wargaSnapshot.forEach(doc => {
      allPayments.push({
        path: doc.ref.path,
        data: doc.data()
      });
    });
  }
  
  return allPayments;
}

async function getAllRelatedData() {
  const firestoreUsers = await getFirestoreUsersToDelete();
  const userIds = firestoreUsers.map(user => user.id);
  
  const relatedData = {
    users: firestoreUsers,
    payments: [],
    templates: [],
    timeline: null,
    pairing: []
  };
  
  try {
    const timelineDoc = await db.collection('active_timeline').doc('current').get();
    if (timelineDoc.exists()) {
      relatedData.timeline = timelineDoc.data();
      
      const paymentData = await getPaymentData(timelineDoc.data().id);
      relatedData.payments = paymentData.filter(payment => 
        userIds.includes(payment.data.wargaId)
      );
    }
  } catch (error) {
    console.log('No timeline data found');
  }
  
  try {
    const templatesSnapshot = await db.collection('timeline_templates').get();
    templatesSnapshot.forEach(doc => {
      relatedData.templates.push({
        id: doc.id,
        path: doc.ref.path,
        data: doc.data()
      });
    });
  } catch (error) {
    console.log('No template data found');
  }
  
  try {
    const pairingSnapshot = await db.collection('rfid_pairing').get();
    pairingSnapshot.forEach(doc => {
      if (userIds.includes(doc.data().wargaId)) {
        relatedData.pairing.push({
          id: doc.id,
          path: doc.ref.path,
          data: doc.data()
        });
      }
    });
  } catch (error) {
    console.log('No pairing data found');
  }
  
  return relatedData;
}

async function getAllTimelineData() {
  const timelineData = {
    activeTimeline: null,
    allPayments: [],
    templates: []
  };
  
  try {
    const timelineDoc = await db.collection('active_timeline').doc('current').get();
    if (timelineDoc.exists()) {
      timelineData.activeTimeline = {
        id: 'current',
        path: timelineDoc.ref.path,
        data: timelineDoc.data()
      };
      
      const allPaymentData = await getPaymentData(timelineDoc.data().id);
      timelineData.allPayments = allPaymentData;
    }
  } catch (error) {
    console.log('No timeline data found');
  }
  
  try {
    const templatesSnapshot = await db.collection('timeline_templates').get();
    templatesSnapshot.forEach(doc => {
      timelineData.templates.push({
        id: doc.id,
        path: doc.ref.path,
        data: doc.data()
      });
    });
  } catch (error) {
    console.log('No template data found');
  }
  
  return timelineData;
}

async function getAllUserTimelineData() {
  const allUsers = await getAllFirestoreUsers();
  const userTimelineData = [];
  
  for (const user of allUsers) {
    try {
      const userTimelineRef = db.collection('users').doc(user.id).collection('timelines');
      const userTimelineSnapshot = await userTimelineRef.get();
      
      userTimelineSnapshot.forEach(doc => {
        userTimelineData.push({
          userId: user.id,
          userName: user.namaWarga || user.email,
          timelineId: doc.id,
          path: doc.ref.path,
          data: doc.data()
        });
      });
    } catch (error) {
      console.log(`No timeline data found for user ${user.id}`);
    }
  }
  
  return userTimelineData;
}

async function showDryRun(deleteOptions) {
  console.log('\n=== DRY RUN MODE ===');
  console.log('Analisis data yang akan dihapus...\n');
  
  const authUsers = deleteOptions.includes('auth') ? await getAuthUsersToDelete() : [];
  const relatedData = deleteOptions.includes('firestore') ? await getAllRelatedData() : null;
  const timelineData = deleteOptions.includes('timeline') ? await getAllTimelineData() : null;
  const userTimelineData = deleteOptions.includes('user-timeline') ? await getAllUserTimelineData() : null;
  
  if (deleteOptions.includes('auth')) {
    console.log(`📧 AUTH USERS (${authUsers.length}):`);
    if (authUsers.length === 0) {
      console.log('  Tidak ada user auth yang akan dihapus\n');
    } else {
      authUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (UID: ${user.uid})`);
      });
      console.log('');
    }
  }
  
  if (deleteOptions.includes('firestore') && relatedData) {
    console.log(`🗃️  FIRESTORE USERS (${relatedData.users.length}):`);
    if (relatedData.users.length === 0) {
      console.log('  Tidak ada user firestore yang akan dihapus\n');
    } else {
      relatedData.users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.namaWarga || 'No Name'})`);
      });
      console.log('');
    }
    
    console.log(`💰 PAYMENT DATA (${relatedData.payments.length}):`);
    if (relatedData.payments.length === 0) {
      console.log('  Tidak ada data pembayaran yang akan dihapus\n');
    } else {
      console.log(`  ${relatedData.payments.length} records pembayaran akan dihapus\n`);
    }
    
    console.log(`📋 TIMELINE TEMPLATES (${relatedData.templates.length}):`);
    if (relatedData.templates.length === 0) {
      console.log('  Tidak ada template yang akan dihapus\n');
    } else {
      console.log(`  ${relatedData.templates.length} templates akan dihapus\n`);
    }
    
    console.log(`🏷️  RFID PAIRING (${relatedData.pairing.length}):`);
    if (relatedData.pairing.length === 0) {
      console.log('  Tidak ada data pairing yang akan dihapus\n');
    } else {
      console.log(`  ${relatedData.pairing.length} pairing records akan dihapus\n`);
    }
  }
  
  if (deleteOptions.includes('timeline') && timelineData) {
    console.log(`⏰ TIMELINE DATA:`);
    if (!timelineData.activeTimeline) {
      console.log('  Tidak ada active timeline\n');
    } else {
      console.log(`  Active Timeline: ${timelineData.activeTimeline.data.id || 'current'}`);
      console.log(`  Payment Records: ${timelineData.allPayments.length}`);
      console.log(`  Timeline Templates: ${timelineData.templates.length}\n`);
    }
  }
  
  if (deleteOptions.includes('user-timeline') && userTimelineData) {
    console.log(`👥 USER TIMELINE DATA (${userTimelineData.length}):`);
    if (userTimelineData.length === 0) {
      console.log('  Tidak ada timeline data di user collection\n');
    } else {
      const userGroups = {};
      userTimelineData.forEach(item => {
        if (!userGroups[item.userId]) {
          userGroups[item.userId] = { name: item.userName, count: 0 };
        }
        userGroups[item.userId].count++;
      });
      
      Object.values(userGroups).forEach((group, index) => {
        console.log(`  ${index + 1}. ${group.name} - ${group.count} timeline(s)`);
      });
      console.log('');
    }
  }
  
  console.log('🛡️  PROTECTED EMAILS:');
  PROTECTED_EMAILS.forEach(email => {
    console.log(`  - ${email}`);
  });
  console.log('');
  
  return { authUsers, relatedData, timelineData, userTimelineData };
}

async function deleteAuthUsers(users) {
  console.log('\n🔥 MENGHAPUS AUTH USERS...');
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    
    try {
      await auth.deleteUser(user.uid);
      successCount++;
      console.log(`✅ ${i + 1}/${users.length} - Deleted: ${user.email}`);
    } catch (error) {
      errorCount++;
      errors.push({ email: user.email, error: error.message });
      console.log(`❌ ${i + 1}/${users.length} - Error: ${user.email}`);
    }
    
    if (i < users.length - 1) {
      await delay(100);
    }
  }
  
  return { successCount, errorCount, errors };
}

async function deleteFirestoreData(relatedData) {
  console.log('\n🗃️  MENGHAPUS FIRESTORE DATA...');
  
  const batch = db.batch();
  let deleteCount = 0;
  
  relatedData.users.forEach(user => {
    const userRef = db.collection('users').doc(user.id);
    batch.delete(userRef);
    deleteCount++;
  });
  
  relatedData.payments.forEach(payment => {
    const paymentRef = db.doc(payment.path);
    batch.delete(paymentRef);
    deleteCount++;
  });
  
  relatedData.templates.forEach(template => {
    const templateRef = db.doc(template.path);
    batch.delete(templateRef);
    deleteCount++;
  });
  
  relatedData.pairing.forEach(pairing => {
    const pairingRef = db.doc(pairing.path);
    batch.delete(pairingRef);
    deleteCount++;
  });
  
  try {
    await batch.commit();
    console.log(`✅ Berhasil menghapus ${deleteCount} dokumen dari Firestore`);
    return { successCount: deleteCount, errorCount: 0 };
  } catch (error) {
    console.log(`❌ Error menghapus Firestore data: ${error.message}`);
    return { successCount: 0, errorCount: deleteCount };
  }
}

async function deleteTimelineData(timelineData) {
  console.log('\n⏰ MENGHAPUS TIMELINE DATA...');
  
  const batch = db.batch();
  let deleteCount = 0;
  
  if (timelineData.activeTimeline) {
    const timelineRef = db.doc(timelineData.activeTimeline.path);
    batch.delete(timelineRef);
    deleteCount++;
    console.log(`🗑️  Menghapus active timeline: ${timelineData.activeTimeline.data.id || 'current'}`);
  }
  
  timelineData.allPayments.forEach(payment => {
    const paymentRef = db.doc(payment.path);
    batch.delete(paymentRef);
    deleteCount++;
  });
  
  timelineData.templates.forEach(template => {
    const templateRef = db.doc(template.path);
    batch.delete(templateRef);
    deleteCount++;
  });
  
  try {
    await batch.commit();
    console.log(`✅ Berhasil menghapus ${deleteCount} dokumen timeline`);
    return { successCount: deleteCount, errorCount: 0 };
  } catch (error) {
    console.log(`❌ Error menghapus timeline data: ${error.message}`);
    return { successCount: 0, errorCount: deleteCount };
  }
}

async function deleteUserTimelineData(userTimelineData) {
  console.log('\n👥 MENGHAPUS USER TIMELINE DATA...');
  
  const batch = db.batch();
  let deleteCount = 0;
  
  userTimelineData.forEach(timeline => {
    const timelineRef = db.doc(timeline.path);
    batch.delete(timelineRef);
    deleteCount++;
  });
  
  try {
    await batch.commit();
    console.log(`✅ Berhasil menghapus ${deleteCount} timeline data dari user collections`);
    return { successCount: deleteCount, errorCount: 0 };
  } catch (error) {
    console.log(`❌ Error menghapus user timeline data: ${error.message}`);
    return { successCount: 0, errorCount: deleteCount };
  }
}

async function handleDryRun() {
  const deleteOptions = ['auth', 'firestore', 'timeline', 'user-timeline'];
  await showDryRun(deleteOptions);
  console.log('✅ Dry run selesai. Tidak ada data yang dihapus.');
  
  console.log('\nTekan Enter untuk kembali ke menu...');
  await inquirer.prompt([{
    type: 'input',
    name: 'continue',
    message: ''
  }]);
}

async function handleDeleteOperation(operation) {
  const deleteOptions = [];
  if (operation === 'auth-only' || operation === 'both' || operation === 'delete-all') deleteOptions.push('auth');
  if (operation === 'firestore-only' || operation === 'both' || operation === 'delete-all') deleteOptions.push('firestore');
  if (operation === 'timeline-only' || operation === 'delete-all') deleteOptions.push('timeline');
  if (operation === 'timeline-with-users' || operation === 'delete-all') {
    deleteOptions.push('timeline');
    deleteOptions.push('user-timeline');
  }
  
  const { authUsers, relatedData, timelineData, userTimelineData } = await showDryRun(deleteOptions);
  
  const totalItems = (authUsers?.length || 0) + 
                   (relatedData?.users?.length || 0) + 
                   (relatedData?.payments?.length || 0) + 
                   (relatedData?.templates?.length || 0) + 
                   (relatedData?.pairing?.length || 0) +
                   (timelineData?.activeTimeline ? 1 : 0) +
                   (timelineData?.allPayments?.length || 0) +
                   (timelineData?.templates?.length || 0) +
                   (userTimelineData?.length || 0);
  
  if (totalItems === 0) {
    console.log('✅ Tidak ada data yang perlu dihapus.');
    console.log('\nTekan Enter untuk kembali ke menu...');
    await inquirer.prompt([{
      type: 'input',
      name: 'continue',
      message: ''
    }]);
    return;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('⚠️  PERINGATAN: Operasi ini TIDAK DAPAT DIBATALKAN!');
  console.log('='.repeat(60));
  
  const { confirmDelete } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmDelete',
      message: `Apakah Anda yakin ingin menghapus ${totalItems} item?`,
      default: false
    }
  ]);
  
  if (!confirmDelete) {
    console.log('Operasi dibatalkan.');
    console.log('\nTekan Enter untuk kembali ke menu...');
    await inquirer.prompt([{
      type: 'input',
      name: 'continue',
      message: ''
    }]);
    return;
  }
  
  const { finalConfirm } = await inquirer.prompt([
    {
      type: 'input',
      name: 'finalConfirm',
      message: 'Ketik "DELETE" untuk konfirmasi final:',
      validate: (input) => {
        if (input === 'DELETE') return true;
        return 'Anda harus mengetik "DELETE" untuk melanjutkan';
      }
    }
  ]);
  
  console.log('\n🚀 Memulai proses penghapusan...');
  
  let totalSuccess = 0;
  let totalErrors = 0;
  
  if (deleteOptions.includes('auth') && authUsers.length > 0) {
    const authResult = await deleteAuthUsers(authUsers);
    totalSuccess += authResult.successCount;
    totalErrors += authResult.errorCount;
  }
  
  if (deleteOptions.includes('firestore') && relatedData) {
    const firestoreResult = await deleteFirestoreData(relatedData);
    totalSuccess += firestoreResult.successCount;
    totalErrors += firestoreResult.errorCount;
  }
  
  if (deleteOptions.includes('timeline') && timelineData) {
    const timelineResult = await deleteTimelineData(timelineData);
    totalSuccess += timelineResult.successCount;
    totalErrors += timelineResult.errorCount;
  }
  
  if (deleteOptions.includes('user-timeline') && userTimelineData) {
    const userTimelineResult = await deleteUserTimelineData(userTimelineData);
    totalSuccess += userTimelineResult.successCount;
    totalErrors += userTimelineResult.errorCount;
  }
  
  console.log('\n' + '='.repeat(40));
  console.log('📊 HASIL AKHIR');
  console.log('='.repeat(40));
  console.log(`✅ Total berhasil: ${totalSuccess}`);
  console.log(`❌ Total error: ${totalErrors}`);
  console.log('='.repeat(40));
  
  console.log('\nTekan Enter untuk kembali ke menu...');
  await inquirer.prompt([{
    type: 'input',
    name: 'continue',
    message: ''
  }]);
}

async function showMainMenu() {
  if (!inquirer) {
    inquirer = (await import('inquirer')).default;
  }
  
  console.clear();
  console.log('🔥 Firebase User Cleanup Tool');
  console.log('=============================\n');
  
  const { operation } = await inquirer.prompt([
    {
      type: 'list',
      name: 'operation',
      message: 'Pilih operasi yang ingin dilakukan:',
      choices: [
        { name: '🔍 Dry Run Only (Lihat data saja)', value: 'dry-run' },
        { name: '📧 Hapus Auth Users saja', value: 'auth-only' },
        { name: '🗃️  Hapus Firestore Data saja', value: 'firestore-only' },
        { name: '💥 Hapus Keduanya (Auth + Firestore)', value: 'both' },
        { name: '─────────────────────────', disabled: true },
        { name: '⏰ Hapus Timeline saja', value: 'timeline-only' },
        { name: '🗂️  Hapus Timeline + Timeline Data di semua User', value: 'timeline-with-users' },
        { name: '─────────────────────────', disabled: true },
        { name: '🔥 HAPUS SEMUA DATA (Auth + Firestore + Timeline + User Timeline)', value: 'delete-all' },
        { name: '─────────────────────────', disabled: true },
        { name: '❌ Keluar', value: 'exit' }
      ]
    }
  ]);
  
  return operation;
}

async function main() {
  if (!inquirer) {
    inquirer = (await import('inquirer')).default;
  }
  
  try {
    while (true) {
      const operation = await showMainMenu();
      
      if (operation === 'exit') {
        console.log('\n👋 Terima kasih! Sampai jumpa lagi.');
        break;
      }
      
      if (operation === 'dry-run') {
        await handleDryRun();
      } else {
        await handleDeleteOperation(operation);
      }
    }
  } catch (error) {
    if (error.isTtyError || error.message.includes('User force closed')) {
      console.log('\n\n👋 Program dihentikan oleh user. Sampai jumpa!');
    } else {
      console.error('\n❌ Error:', error.message);
    }
  }
  
  process.exit(0);
}

process.on('SIGINT', () => {
  console.log('\n\n👋 Program dihentikan oleh user (Ctrl+C). Sampai jumpa!');
  process.exit(0);
});

main().catch(console.error);