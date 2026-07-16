import { PutObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs/promises";
import path from "path";
import { createReadStream, existsSync } from "fs";
import { Readable } from "stream";

const LOCAL_MEDIA_ROOT = path.join(process.cwd(), "data", "media");

function r2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET
  );
}

function getS3(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function putObject(key: string, body: Buffer | Uint8Array, contentType: string): Promise<void> {
  if (r2Configured()) {
    await getS3().send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
    return;
  }
  const full = path.join(LOCAL_MEDIA_ROOT, key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, body);
}

export async function getObjectBuffer(key: string): Promise<Buffer | null> {
  if (r2Configured()) {
    try {
      const res = await getS3().send(
        new GetObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key })
      );
      const bytes = await res.Body?.transformToByteArray();
      return bytes ? Buffer.from(bytes) : null;
    } catch {
      return null;
    }
  }
  const full = path.join(LOCAL_MEDIA_ROOT, key);
  try {
    return await fs.readFile(full);
  } catch {
    return null;
  }
}

export async function createUploadUrl(
  key: string,
  contentType: string
): Promise<{ uploadUrl: string; key: string; mode: "r2" | "local" }> {
  if (r2Configured()) {
    const url = await getSignedUrl(
      getS3(),
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: 60 * 30 }
    );
    return { uploadUrl: url, key, mode: "r2" };
  }
  return { uploadUrl: `/api/media/upload?key=${encodeURIComponent(key)}`, key, mode: "local" };
}

export async function createDownloadUrl(key: string): Promise<string> {
  if (r2Configured() && process.env.R2_PUBLIC_BASE_URL) {
    return `${process.env.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`;
  }
  if (r2Configured()) {
    return getSignedUrl(
      getS3(),
      new GetObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key }),
      { expiresIn: 60 * 60 }
    );
  }
  return `/api/media/file?key=${encodeURIComponent(key)}`;
}

export function localMediaPath(key: string): string {
  return path.join(LOCAL_MEDIA_ROOT, key);
}

export function localMediaExists(key: string): boolean {
  return existsSync(localMediaPath(key));
}

export function openLocalMediaStream(key: string): Readable | null {
  const full = localMediaPath(key);
  if (!existsSync(full)) return null;
  return createReadStream(full);
}

export { LOCAL_MEDIA_ROOT };
