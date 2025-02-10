import { and, eq, sql } from "drizzle-orm";
import { type Session } from "next-auth";
import { type DB } from "~/server/db";
import { generationLimits } from "../db/schema";

const UNAUTHENTICATED_LIMIT = 3;
const AUTHENTICATED_LIMIT = 20;

interface RateLimitInfo {
  remaining: number;
  total: number;
  used: number;
}

interface RateLimitResult {
  success: boolean;
  info: RateLimitInfo;
  message?: string;
}

export async function getCurrentRateLimit(
  db: DB,
  ipAddress: string | null,
  session: Session | null,
): Promise<RateLimitInfo> {
  if (session?.user) {
    // Get authenticated user limit
    const userLimit = await db.query.generationLimits.findFirst({
      where: and(
        eq(generationLimits.userId, session.user.id),
        eq(generationLimits.date, sql`CURRENT_DATE`),
      ),
    });

    const count = userLimit?.count ?? 0;
    return {
      remaining: AUTHENTICATED_LIMIT - count,
      total: AUTHENTICATED_LIMIT,
      used: count,
    };
  } else if (ipAddress) {
    // Get unauthenticated user limit
    const ipLimit = await db.query.generationLimits.findFirst({
      where: and(
        eq(generationLimits.ipAddress, ipAddress),
        eq(generationLimits.date, sql`CURRENT_DATE`),
      ),
    });

    const count = ipLimit?.count ?? 0;
    return {
      remaining: UNAUTHENTICATED_LIMIT - count,
      total: UNAUTHENTICATED_LIMIT,
      used: count,
    };
  } else {
    return {
      remaining: UNAUTHENTICATED_LIMIT,
      total: UNAUTHENTICATED_LIMIT,
      used: 0,
    };
  }
}

export async function checkAndUpdateRateLimit(
  db: DB,
  ipAddress: string | null,
  session: Session | null,
): Promise<RateLimitResult> {
  if (session?.user) {
    // Check and update authenticated user limit
    const result = await db
      .insert(generationLimits)
      .values({
        userId: session.user.id,
        count: 1,
        date: sql`CURRENT_DATE`,
      })
      .onConflictDoUpdate({
        target: [generationLimits.userId, generationLimits.date],
        set: {
          count: sql`${generationLimits.count} + 1`,
        },
        where: sql`${generationLimits.count} < ${AUTHENTICATED_LIMIT}`,
      })
      .returning();

    // If no row was returned, it means we hit the limit
    if (result.length === 0) {
      return {
        success: false,
        info: {
          remaining: 0,
          total: AUTHENTICATED_LIMIT,
          used: AUTHENTICATED_LIMIT,
        },
        message: `You have reached your daily limit of ${AUTHENTICATED_LIMIT} generations. Please try again tomorrow.`,
      };
    }

    const count = result[0]?.count ?? AUTHENTICATED_LIMIT;
    return {
      success: true,
      info: {
        remaining: AUTHENTICATED_LIMIT - count,
        total: AUTHENTICATED_LIMIT,
        used: count,
      },
    };
  } else if (ipAddress) {
    // Check and update unauthenticated user limit
    const result = await db
      .insert(generationLimits)
      .values({
        ipAddress,
        count: 1,
        date: sql`CURRENT_DATE`,
      })
      .onConflictDoUpdate({
        target: [generationLimits.ipAddress, generationLimits.date],
        set: {
          count: sql`${generationLimits.count} + 1`,
        },
        where: sql`${generationLimits.count} < ${UNAUTHENTICATED_LIMIT}`,
      })
      .returning();

    // If no row was returned, it means we hit the limit
    if (result.length === 0) {
      return {
        success: false,
        info: {
          remaining: 0,
          total: UNAUTHENTICATED_LIMIT,
          used: UNAUTHENTICATED_LIMIT,
        },
        message: `You have reached your daily limit of ${UNAUTHENTICATED_LIMIT} generations. Please sign in to get ${AUTHENTICATED_LIMIT} generations per day, or try again tomorrow.`,
      };
    }

    const count = result[0]?.count ?? UNAUTHENTICATED_LIMIT;
    return {
      success: true,
      info: {
        remaining: UNAUTHENTICATED_LIMIT - count,
        total: UNAUTHENTICATED_LIMIT,
        used: count,
      },
    };
  } else {
    return {
      success: false,
      info: {
        remaining: 0,
        total: UNAUTHENTICATED_LIMIT,
        used: 0,
      },
      message: "Could not determine user identity for rate limiting.",
    };
  }
}
