import { type DB } from "~/server/db";
import { generatedReadmes } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";

/**
 * Generates a short random ID with specified length
 * @param length Length of the ID to generate (default: 4)
 * @returns Random alphanumeric string of specified length
 */
export function generateShortId(length = 4): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }
  
  return result;
}

/**
 * Generates a unique short ID that doesn't exist for a given repo path
 * @param db Database client
 * @param repoPath Repository path
 * @param maxAttempts Maximum number of attempts to generate a unique ID
 * @returns A unique short ID for the repo
 */
export async function generateUniqueShortId(
  db: DB,
  repoPath: string,
  maxAttempts = 10
): Promise<string> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const candidateId = generateShortId();
    
    // Check if this ID is already used for this repo
    const existing = await db.query.generatedReadmes.findFirst({
      where: and(
        eq(generatedReadmes.repoPath, repoPath),
        eq(generatedReadmes.shortId, candidateId)
      ),
    });
    
    if (!existing) {
      return candidateId;
    }
    
    attempts++;
  }
  
  // If we've tried too many times, make a longer ID to reduce collision chance
  return generateShortId(6);
} 