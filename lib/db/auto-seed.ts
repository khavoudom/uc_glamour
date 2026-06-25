import { logger } from '../logger';
import { seedAdmin } from '../../scripts/seed-admin';
import { seedCosmetics } from '../../scripts/seed-cosmetics';

const log = logger('lib/db/auto-seed');

export async function autoSeed() {
  log.info('Running auto-seed...');
  await seedAdmin().catch((e) => {
    log.error('seed-admin failed', { message: e.message });
  });
  await seedCosmetics().catch((e) => {
    log.error('seed-cosmetics failed', { message: e.message });
  });
  log.info('Auto-seed complete');
}
