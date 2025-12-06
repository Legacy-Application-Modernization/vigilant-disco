# S3 Integration Documentation

## Overview

This application integrates with AWS S3 to store and download project files. The folder structure in S3 follows this pattern:

```
bucket-name/
  └── {userId}/
      └── {ownerName}/
          └── {fileName}.zip
```

### Example:
```
lg-s3-store/
  └── 0JEGH9KEOjNOA7usjdjNlMd5go42/
      └── Legacy-Application-Modernization/
          └── Blog-API-PHP.zip
```

## Data Structure

### Firestore Project Document
Projects in Firestore **must** include the following fields for S3 integration:
- **`user_id`**: User ID from Firestore (e.g., `0JEGH9KEOjNOA7usjdjNlMd5go42`)
- **`owner`**: GitHub repository owner (e.g., `Legacy-Application-Modernization`)
- **`repo`**: Repository name (e.g., `Blog-API-PHP`)
- **`sourceLanguage`**: Source programming language (e.g., `PHP`)

**Important**: The `user_id` in the Firestore project document is used for S3 path construction, NOT the authenticated user's Firebase UID.

### S3 Path Construction
The S3 path is constructed as:
```
{project.userId}/{project.owner}/{project.repo}.zip
```

Example:
```
0JEGH9KEOjNOA7usjdjNlMd5go42/Legacy-Application-Modernization/Blog-API-PHP.zip
```

**Note**: The repo name already includes the full file identifier (e.g., "Blog-API-PHP"), so we only append `.zip` extension.

### Migrating Existing Projects

If you have existing projects in Firestore without `owner` and `repo` fields, you need to update them:

```javascript
// Example: Update a project in Firestore
const projectRef = db.collection('projects').doc(projectId);
await projectRef.update({
  owner: 'Legacy-Application-Modernization',
  repo: 'Blog-API-PHP'
});
```

Or manually in Firestore Console:
1. Open your project document
2. Add field `owner` with value (e.g., `Legacy-Application-Modernization`)
3. Add field `repo` with value (e.g., `Blog-API-PHP`)
4. Save the document

## Setup Instructions

### 1. AWS Configuration

#### Create an S3 Bucket
1. Log in to AWS Console
2. Navigate to S3
3. Create a new bucket named `lg-s3-store` (or your preferred name)
4. Configure bucket permissions and CORS as needed

#### Create IAM User with S3 Access
1. Navigate to IAM in AWS Console
2. Create a new user with programmatic access
3. Attach the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:HeadObject"
      ],
      "Resource": "arn:aws:s3:::lg-s3-store/*"
    }
  ]
}
```

4. Save the Access Key ID and Secret Access Key

### 2. Environment Variables

Add the following environment variables to your server `.env` file:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET_NAME=lg-s3-store
```

### 3. Server Configuration

The S3 integration is automatically configured when the server starts. The following files handle S3 operations:

- **`server/src/config/s3.ts`**: S3 client configuration
- **`server/src/services/s3.service.ts`**: S3 service with download methods
- **`server/src/controllers/project.controller.ts`**: Download endpoint implementation
- **`server/src/routes/project.routes.ts`**: Download route definition

## Usage

### Client-Side Implementation

The `ExportProject` component handles the download functionality:

```tsx
import apiService from '../../services/api';

// Download project
const handleDownloadProject = async () => {
  const response = await apiService.downloadProject(projectId);
  
  if (response.success) {
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = response.data.downloadUrl;
    link.download = response.data.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
```

### API Endpoint

**GET** `/api/v1/projects/:id/download`

**Response:**
```json
{
  "success": true,
  "message": "Download URL generated successfully",
  "data": {
    "downloadUrl": "https://lg-s3-store.s3.amazonaws.com/...",
    "fileName": "Blog-API-PHP.zip",
    "expiresIn": 3600,
    "s3Path": "0JEGH9KEOjNOA7usjdjNlMd5go42/Legacy-Application-Modernization/Blog-API-PHP.zip"
  }
}
```

### Server-Side Service

```typescript
import s3Service from '../services/s3.service';

// Generate download URL
const downloadUrl = await s3Service.getDownloadUrl(
  userId,        // Encrypted user ID
  ownerName,     // Repository owner name
  fileName,      // Zip file name
  3600           // URL expires in 1 hour
);

// Check if file exists
const exists = await s3Service.fileExists(userId, ownerName, fileName);

// Get file metadata
const metadata = await s3Service.getFileMetadata(userId, ownerName, fileName);
```

## File Naming Convention

The system automatically constructs file names using this pattern:

```
{ProjectName}-API-{SourceLanguage}.zip
```

Examples:
- `Blog-API-PHP.zip`
- `E-Commerce-API-Python.zip`
- `CRM-System-API-Java.zip`

## Folder Structure

### S3 Path Components:

1. **User ID (Encrypted)**: Firebase UID or encrypted user identifier
   - Example: `0JEGH9KEOjNOA7usjdjNlMd5go42`

2. **Owner Name**: Repository owner from Git URL
   - Extracted from: `https://github.com/{ownerName}/{repository}`
   - Example: `Legacy-Application-Modernization`

3. **File Name**: Project zip file
   - Format: `{ProjectName}-API-{Language}.zip`
   - Example: `Blog-API-PHP.zip`

## Security Features

### Presigned URLs
- URLs are temporary and expire after 1 hour (configurable)
- No permanent public access to S3 objects
- Secure authentication required to generate URLs

### Authentication
- All download requests require valid authentication
- Only project owners can download their projects
- Firebase authentication token validation

### Error Handling
- File not found errors return 404
- Invalid authentication returns 401
- Server errors return 500 with appropriate messages

## Error Responses

### File Not Found
```json
{
  "success": false,
  "message": "Project file not found in storage",
  "error": "FILE_NOT_FOUND"
}
```

### Unauthorized
```json
{
  "success": false,
  "message": "User not authenticated",
  "error": "UNAUTHORIZED"
}
```

### Internal Server Error
```json
{
  "success": false,
  "message": "Failed to generate download URL",
  "error": "INTERNAL_SERVER_ERROR"
}
```

## Testing

### Manual Testing

1. Save a project through the UI
2. Click the "Download" button in the Export Project page
3. Verify the file downloads correctly
4. Check the browser's download manager

### Using cURL

```bash
# Get download URL
curl -X GET \
  http://localhost:3001/api/v1/projects/{projectId}/download \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Download file using presigned URL
curl -o project.zip "PRESIGNED_URL"
```

## Troubleshooting

### Common Issues

1. **"AWS credentials not found"**
   - Verify `.env` file contains correct AWS credentials
   - Check environment variables are loaded properly

2. **"File not found in S3"**
   - Verify the file exists in S3 bucket
   - Check the folder structure matches the expected pattern
   - Ensure bucket name is correct

3. **"Access Denied"**
   - Verify IAM user has correct permissions
   - Check bucket policy allows GetObject operations

4. **"Presigned URL expired"**
   - URLs expire after 1 hour by default
   - Generate a new download URL

### Debugging

Enable detailed logging:

```env
LOG_LEVEL=debug
```

Check server logs for S3 operations:
- S3 key generation
- File existence checks
- Presigned URL generation

## Best Practices

1. **Environment Variables**: Never commit AWS credentials to version control
2. **URL Expiration**: Keep presigned URL expiration time reasonable (default: 1 hour)
3. **Error Handling**: Always handle S3 errors gracefully on the client
4. **File Naming**: Use consistent naming conventions for easy management
5. **Logging**: Log all S3 operations for debugging and auditing

## Future Enhancements

- [ ] Add file upload capability to S3
- [ ] Implement S3 bucket lifecycle policies
- [ ] Add file size validation before download
- [ ] Support for multiple file versions
- [ ] Implement download analytics and tracking
- [ ] Add support for CloudFront CDN integration
