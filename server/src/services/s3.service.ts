import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client, { S3_BUCKET_NAME } from '../config/s3';
import { logger } from '../utils/logger';

class S3Service {
  /**
   * Generate a presigned URL for downloading a file from S3
   * @param userId - The user ID (encrypted folder name)
   * @param ownerName - The repository owner name
   * @param fileName - The name of the zip file
   * @param expiresIn - URL expiration time in seconds (default: 1 hour)
   * @returns Presigned URL for downloading the file
   */
  async getDownloadUrl(
    userId: string,
    ownerName: string,
    fileName: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      // Construct S3 key based on the folder structure: userId/ownerName/fileName
      const key = `${userId}/${ownerName}/${fileName}`;

      logger.info(`Generating presigned URL for S3 key: ${key}`);

      // First, check if the file exists
      const headCommand = new HeadObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
      });

      try {
        await s3Client.send(headCommand);
      } catch (error: any) {
        if (error.name === 'NotFound') {
          throw new Error(`File not found in S3: ${key}`);
        }
        throw error;
      }

      // Generate presigned URL
      const command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
      });

      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });

      logger.info(`Successfully generated presigned URL for: ${key}`);
      return presignedUrl;
    } catch (error: any) {
      logger.error(`Error generating presigned URL: ${error.message}`);
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }
  }

  /**
   * Check if a file exists in S3
   * @param userId - The user ID (encrypted folder name)
   * @param ownerName - The repository owner name
   * @param fileName - The name of the zip file
   * @returns true if file exists, false otherwise
   */
  async fileExists(
    userId: string,
    ownerName: string,
    fileName: string
  ): Promise<boolean> {
    try {
      const key = `${userId}/${ownerName}/${fileName}`;
      
      const headCommand = new HeadObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(headCommand);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return false;
      }
      logger.error(`Error checking file existence: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get file metadata from S3
   * @param userId - The user ID (encrypted folder name)
   * @param ownerName - The repository owner name
   * @param fileName - The name of the zip file
   * @returns File metadata including size, last modified, etc.
   */
  async getFileMetadata(
    userId: string,
    ownerName: string,
    fileName: string
  ): Promise<any> {
    try {
      const key = `${userId}/${ownerName}/${fileName}`;
      
      const headCommand = new HeadObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
      });

      const response = await s3Client.send(headCommand);
      
      return {
        size: response.ContentLength,
        lastModified: response.LastModified,
        contentType: response.ContentType,
        metadata: response.Metadata,
      };
    } catch (error: any) {
      logger.error(`Error getting file metadata: ${error.message}`);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }
}

export default new S3Service();
