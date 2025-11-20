import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const bucketName = 'scent-siphon-admin';

export async function POST(request) {
  const formData = await request.formData();
  const files = formData.getAll('file');
  
  console.log('length:', files.length);
  
  const client = new S3Client({
    region: 'us-west-2',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });
  
  const links = [];
  
  for (const file of files) {
    const ext = file.name.split('.').pop();
    const newFilename = Date.now() + '.' + ext;
    
    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: newFilename,
      Body: buffer,
      ACL: 'public-read',
      ContentType: file.type,
    }));
    
    const link = `https://${bucketName}.s3.amazonaws.com/${newFilename}`;
    links.push(link);
  }
  
  return NextResponse.json({links});
}