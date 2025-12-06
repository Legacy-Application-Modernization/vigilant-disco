# Quick Start: S3 Download Integration

## Setup Steps

### 1. Configure AWS Credentials

Add to `server/.env`:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET_NAME=lg-s3-store
```

### 2. Restart Server

```bash
cd server
npm run dev
```

### 3. Usage Flow

1. **User uploads and converts code** → Project is saved
2. **Project metadata includes**: Repository URL and owner name
3. **User clicks "Download" button** → Triggers S3 download
4. **System constructs S3 path**: `{userId}/{ownerName}/{projectName}-API-{language}.zip`
5. **Generates presigned URL** → Valid for 1 hour
6. **Browser downloads file** → Direct from S3

## S3 Folder Structure

Based on your S3 bucket structure:

```
lg-s3-store/
  └── 0JEGH9KEOjNOA7usjdjNlMd5go42/          ← User ID (encrypted)
      └── Legacy-Application-Modernization/   ← Repository Owner
          └── Blog-API-PHP.zip                 ← Project File
```

## API Endpoint

```
GET /api/v1/projects/:projectId/download
Authorization: Bearer {firebase-token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://lg-s3-store.s3.amazonaws.com/...",
    "fileName": "Blog-API-PHP.zip",
    "expiresIn": 3600,
    "s3Path": "0JEGH9KEOjNOA7usjdjNlMd5go42/Legacy-Application-Modernization/Blog-API-PHP.zip"
  }
}
```

## Files Modified/Created

### Server Side:
- ✅ `server/src/config/s3.ts` - S3 client configuration
- ✅ `server/src/services/s3.service.ts` - S3 service methods
- ✅ `server/src/controllers/project.controller.ts` - Download endpoint
- ✅ `server/src/routes/project.routes.ts` - Download route
- ✅ `server/.env.example` - Environment variables documentation

### Client Side:
- ✅ `client/src/services/api.ts` - Download API method
- ✅ `client/src/components/converter/ExportProject.tsx` - Download UI

### Documentation:
- ✅ `docs/S3_INTEGRATION.md` - Complete integration guide

## Testing

1. **Save a project** through the converter flow
2. Navigate to **Export Project** page
3. Click **"Save & Complete Export"** button
4. After successful save, click **"Download"** button
5. File should download from S3

## Security Features

✅ **Authentication Required** - Only authenticated users can download  
✅ **Ownership Verification** - Only project owners can download their projects  
✅ **Presigned URLs** - Temporary URLs expire after 1 hour  
✅ **No Public Access** - Files are not publicly accessible  

## Troubleshooting

- **"Save First" button**: Save the project before downloading
- **"File not found"**: Verify file exists in S3 at the correct path
- **"Access denied"**: Check AWS credentials and IAM permissions
- **Downloads fail**: Check browser console and server logs

For detailed documentation, see `docs/S3_INTEGRATION.md`
