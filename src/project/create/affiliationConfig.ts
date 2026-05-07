import { ENV } from '@/core/config';

export const isAffiliationRequiredAtCreate = (): boolean =>
  Boolean(
    (ENV.plugins as any)?.WALDUR_CORE?.AFFILIATION_REQUIRED_AT_PROJECT_CREATION,
  );
