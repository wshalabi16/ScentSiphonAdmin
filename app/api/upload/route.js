import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { isAdminRequest } from '@/lib/isAdmin';
import { apiErrorHandler } from '@/lib/apiErrorHandler';
import { mongooseConnect } from '@/lib/mongoose';
import crypto from 'crypto';

const bucketName = process.env.S3_BUCKET_NAME;
if (!bucketName) {
  throw new Error('S3_BUCKET_NAME environment variable not set');
}

// Security constants
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10;

// File signature validation (magic numbers)
const VALID_SIGNATURES = {
  'ffd8ffe0': 'jpeg',
  'ffd8ffe1': 'jpeg',
  'ffd8ffe2': 'jpeg',
  '89504e47': 'png',
  '47494638': 'gif',
  '52494646': 'webp'
};

export const POST = apiErrorHandler(async (request) => {
  if (!await isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll('file');

  // Validate file count
  if (files.length > MAX_FILES) {
    return NextResponse.json({
      error: `Maximum ${MAX_FILES} files allowed`
    }, { status: 400 });
  }

  const client = new S3Client({
    region: 'us-west-2',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });

  const links = [];

  for (const file of files) {
    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: `File type ${file.type} not allowed. Only images permitted.`
      }, { status: 400 });
    }

    // Validate file extension
    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({
        error: `File extension .${ext} not allowed`
      }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
      }, { status: 400 });
    }

    // Validate file signature (magic number check)
    const fileSignature = buffer.slice(0, 4).toString('hex');
    const isValidImage = Object.keys(VALID_SIGNATURES).some(sig =>
      fileSignature.startsWith(sig)
    );

    if (!isValidImage) {
      return NextResponse.json({
        error: 'File is not a valid image'
      }, { status: 400 });
    }

    // Generate cryptographically secure random filename
    const randomName = crypto.randomUUID();
    const newFilename = `${randomName}.${ext}`;

    // Map MIME types to correct Content-Type
    const mimeToContentType = {
      'image/jpeg': 'image/jpeg',
      'image/png': 'image/png',
      'image/webp': 'image/webp',
      'image/gif': 'image/gif'
    };

    // Upload with public-read ACL (required for product images to display)
    await client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: newFilename,
      Body: buffer,
      ACL: 'public-read',
      ContentType: mimeToContentType[file.type] || 'image/jpeg',
      Metadata: {
        'original-name': file.name,
        'uploaded-by': 'admin'
      }
    }));

    const link = `https://${bucketName}.s3.amazonaws.com/${newFilename}`;
    links.push(link);
  }

  return NextResponse.json({links});
}, 'FILE_UPLOAD');

export const DELETE = apiErrorHandler(async (request) => {
  await mongooseConnect();

  if (!await isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const filename = request.nextUrl.searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename required' }, { status: 400 });
  }

  // Validate filename format (UUID + extension)
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(jpg|jpeg|png|webp|gif)$/i.test(filename)) {
    return NextResponse.json({ error: 'Invalid filename format' }, { status: 400 });
  }

  const client = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });

  try {
    await client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: filename
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete from S3:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}, 'S3_DELETE');