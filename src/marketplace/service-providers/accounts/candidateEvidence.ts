import { ProviderUsernameConflict } from 'waldur-js-client';

import { translate } from '@/i18n';

type Candidate = ProviderUsernameConflict['candidates'][number];

/**
 * What to weigh when choosing the username a person keeps: how widely it is
 * used, and -- stated either way, so an absence is not read as unknown --
 * whether it has active resources and a recorded home directory, since
 * renaming a live account orphans the files it owns.
 */
export const candidateEvidence = (candidate: Candidate): string[] => [
  translate('used on {count} offering(s)', { count: candidate.offering_count }),
  candidate.has_active_resources
    ? translate('has active resources')
    : translate('no active resources'),
  candidate.home_directories?.length
    ? translate('home directory {paths}', {
        paths: candidate.home_directories.join(', '),
      })
    : translate('no home directory'),
];
