/**
 * Simple API endpoint to list R2 files
 * This should be deployed as a serverless function (e.g., Cloudflare Workers, Vercel, Netlify)
 * 
 * Usage: GET /api/list-r2-files?prefix=MATH/grade5/quarter1/
 */

import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '87001b07874e84e7839c624361f60a3d';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = 'lessonflarer2';

const client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prefix = '' } = req.query;

    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix,
    });

    const data = await client.send(command);
    
    if (!data.Contents || data.Contents.length === 0) {
      return res.status(200).json({ files: [] });
    }

    // Filter and format files
    const files = data.Contents
      .filter(obj => obj.Key.endsWith('.json') || obj.Key.endsWith('.jpg') || obj.Key.endsWith('.jpeg'))
      .map(obj => ({
        key: obj.Key,
        url: `https://pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev/${R2_BUCKET_NAME}/${obj.Key}`,
        size: obj.Size,
        lastModified: obj.LastModified,
        isJson: obj.Key.endsWith('.json'),
        isThumbnail: obj.Key.endsWith('.jpg') || obj.Key.endsWith('.jpeg'),
      }));

    return res.status(200).json({ files });
  } catch (error) {
    console.error('Error listing R2 files:', error);
    return res.status(500).json({ error: error.message });
  }
}

