import 'dotenv/config';
import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { logger } from '../lib/logger';

const log = logger('scripts/seed-admin');

export const ADMIN_EMAIL = 'admin@glamour.com';
export const ADMIN_PASSWORD = '12345678';

export async function seedAdmin() {
  log.info(`Upserting admin user: ${ADMIN_EMAIL}`);

  const hashedPassword = await hash(ADMIN_PASSWORD, 12);
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ hashedPassword, role: 'admin' })
      .where(eq(users.email, ADMIN_EMAIL));
    log.info(`✓ Updated admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    await db.insert(users).values({
      name: 'Admin',
      email: ADMIN_EMAIL,
      hashedPassword,
      role: 'admin',
      emailVerified: true,
    });
    log.info(`✓ Created admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }
}

const isMain = process.argv[1]?.includes('seed-admin');
if (isMain) {
  seedAdmin()
    .catch((e) => {
      log.error(
        'Seed admin failed',
        e instanceof Error ? { message: e.message, stack: e.stack } : { error: e },
      );
      process.exit(1);
    })
    .then(() => process.exit(0));
}
