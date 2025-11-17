# User Role Management Guide

This guide explains how to manage user roles in the Legacy Modernization Platform.

## Available Roles

| Role | Description | Project Limit | Permissions |
|------|-------------|---------------|-------------|
| **user** | Regular user (default) | 2 projects | Standard access |
| **manager** | Elevated privileges | Unlimited | Enhanced features |
| **admin** | Full administrator | Unlimited | Full system access, can manage users |

## Methods to Set User Roles

### Method 1: Command Line Script (Recommended)

The easiest way to update user roles is using the provided script:

```bash
# Navigate to project root
cd /path/to/vigilant-disco

# Set a user as admin
node scripts/set-user-role.js user@example.com admin

# Set a user as manager
node scripts/set-user-role.js user@example.com manager

# Reset a user to regular user
node scripts/set-user-role.js user@example.com user
```

**Prerequisites:**
- Firebase service account key must be in `server/serviceAccountKey.json`
- User must have logged in at least once

**Example Output:**
```
🔍 Searching for user with email: john@example.com...
✅ User found:
   Name: John Doe
   Email: john@example.com
   Current Role: user
   UID: abc123xyz

🔄 Updating role from "user" to "admin"...
✅ Successfully updated role to: admin

👑 Admin privileges granted:
   - Unlimited project creation
   - Can manage other users
   - Full system access
```

### Method 2: API Endpoint (For Programmatic Access)

Admins can update user roles via the API:

**Endpoint:** `PUT /api/v1/users/admin/update-role`

**Headers:**
```
Authorization: Bearer <admin-firebase-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "role": "admin"
}
```

Or using UID:
```json
{
  "uid": "firebase-user-id",
  "role": "manager"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User role updated to admin",
  "data": {
    "uid": "firebase-user-id",
    "email": "user@example.com",
    "role": "admin",
    ...
  }
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:5000/api/v1/users/admin/update-role \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","role":"admin"}'
```

### Method 3: Direct Firestore Update

You can also update roles directly in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Find the `users` collection
5. Locate the user document (by email or UID)
6. Edit the `role` field to `admin`, `manager`, or `user`
7. Click **Update**

## Setting the First Admin

When setting up the platform, you need to create the first admin user:

1. Have the user log in to the platform at least once (this creates their Firestore record)
2. Run the script:
   ```bash
   node scripts/set-user-role.js first-admin@example.com admin
   ```
3. The user now has admin privileges and can manage other users

## Checking User Roles

### Via API
```bash
# Get current user's profile (includes role)
curl http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Via Firebase Console
1. Open Firestore Database
2. Navigate to `users` collection
3. View any user document to see their `role` field

## Role-Based Features

### Project Limits

```typescript
// Automatically enforced in the system
const limits = {
  user: 2,        // Regular users: 2 projects max
  manager: null,  // Managers: unlimited
  admin: null     // Admins: unlimited
};
```

### Access Control

- **Regular users (`user`)**: 
  - Can create up to 2 projects
  - Standard dashboard access
  - Cannot modify other users

- **Managers (`manager`)**:
  - Unlimited project creation
  - Enhanced dashboard features
  - Cannot modify user roles

- **Administrators (`admin`)**:
  - Unlimited project creation
  - Full system access
  - Can update user roles via API
  - Can manage all users

## Troubleshooting

### User Not Found

**Error:** `❌ User not found with email: user@example.com`

**Solutions:**
1. Verify the email address is correct (case-sensitive)
2. Ensure the user has logged in at least once
3. Check Firebase Console to confirm user exists in `users` collection

### serviceAccountKey.json Missing

**Error:** `❌ Error: serviceAccountKey.json not found`

**Solution:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the file as `serviceAccountKey.json` in the `server/` directory
6. **Important:** Add this file to `.gitignore` (already done)

### Permission Denied

**Error:** `Permission denied when updating role`

**Solution:**
- Ensure the Firebase service account has proper permissions
- Check Firestore security rules allow writes to the `users` collection

## Security Best Practices

1. **Protect Service Account Key**: Never commit `serviceAccountKey.json` to version control
2. **Limit Admin Access**: Only grant admin role to trusted users
3. **Audit Changes**: Monitor role changes in production
4. **Use Secure Channels**: Always use HTTPS in production for API calls

## Script Permissions

Make the script executable:
```bash
chmod +x scripts/set-user-role.js
```

Then you can run it directly:
```bash
./scripts/set-user-role.js user@example.com admin
```

## Examples

### Promote a User to Admin
```bash
node scripts/set-user-role.js jane.doe@company.com admin
```

### Promote Multiple Users
```bash
node scripts/set-user-role.js user1@company.com admin
node scripts/set-user-role.js user2@company.com manager
node scripts/set-user-role.js user3@company.com manager
```

### Demote an Admin to Regular User
```bash
node scripts/set-user-role.js former-admin@company.com user
```

## Integration with UI

The user's role is automatically displayed in the header:
- Regular users see: `2 / 2 projects`
- Admins/Managers see: `5 ∞ projects`

Role changes take effect immediately after:
1. User refreshes the page
2. User navigates to a new page
3. Project limits are automatically re-fetched

---

For more information or issues, please contact the development team.
