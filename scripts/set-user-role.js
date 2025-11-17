#!/usr/bin/env node
/**
 * Script to update user roles in Firestore
 * Usage: node scripts/set-user-role.js <email> <role>
 * Example: node scripts/set-user-role.js user@example.com admin
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../server/serviceAccountKey.json');

if (!require('fs').existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found at:', serviceAccountPath);
  console.error('📝 Please download your Firebase service account key and place it in the server folder.');
  console.error('🔗 Get it from: https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk');
  process.exit(1);
}

try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('❌ Error initializing Firebase:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// Validate arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.log('Usage: node scripts/set-user-role.js <email> <role>');
  console.log('');
  console.log('Available roles:');
  console.log('  - admin    : Full access, unlimited projects');
  console.log('  - manager  : Elevated access, unlimited projects');
  console.log('  - user     : Regular user, limited to 2 projects');
  console.log('');
  console.log('Example: node scripts/set-user-role.js john@example.com admin');
  process.exit(1);
}

const [email, role] = args;

// Validate role
const validRoles = ['admin', 'manager', 'user'];
if (!validRoles.includes(role)) {
  console.error(`❌ Invalid role: ${role}`);
  console.error(`✅ Valid roles are: ${validRoles.join(', ')}`);
  process.exit(1);
}

async function setUserRole(userEmail, newRole) {
  try {
    console.log(`🔍 Searching for user with email: ${userEmail}...`);
    
    // Find user by email
    const snapshot = await db.collection('users')
      .where('email', '==', userEmail)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.error(`❌ User not found with email: ${userEmail}`);
      console.log('');
      console.log('💡 Tips:');
      console.log('  - Make sure the user has logged in at least once');
      console.log('  - Check that the email address is correct');
      console.log('  - Email addresses are case-sensitive');
      process.exit(1);
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const currentRole = userData.role || 'user';

    console.log(`✅ User found:`);
    console.log(`   Name: ${userData.displayName || 'N/A'}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Current Role: ${currentRole}`);
    console.log(`   UID: ${userDoc.id}`);
    console.log('');

    if (currentRole === newRole) {
      console.log(`ℹ️  User already has role: ${newRole}`);
      process.exit(0);
    }

    console.log(`🔄 Updating role from "${currentRole}" to "${newRole}"...`);

    // Update the role
    await db.collection('users').doc(userDoc.id).update({
      role: newRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Successfully updated role to: ${newRole}`);
    console.log('');
    
    // Show what this means
    if (newRole === 'admin') {
      console.log('👑 Admin privileges granted:');
      console.log('   - Unlimited project creation');
      console.log('   - Can manage other users');
      console.log('   - Full system access');
    } else if (newRole === 'manager') {
      console.log('📊 Manager privileges granted:');
      console.log('   - Unlimited project creation');
      console.log('   - Elevated access');
    } else {
      console.log('👤 Regular user privileges:');
      console.log('   - Limited to 2 projects');
      console.log('   - Standard access');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user role:', error.message);
    process.exit(1);
  }
}

// Run the script
setUserRole(email, role);
