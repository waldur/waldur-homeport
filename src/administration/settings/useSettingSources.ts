import { useQuery } from '@tanstack/react-query';
import { overrideSettingsSourcesList, SettingSource } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useUser } from '@/workspace/hooks';
import { checkIsStaffOrSupport } from '@/workspace/selectors';

const byKey = (rows: SettingSource[]): Record<string, SettingSource> =>
  Object.fromEntries(rows.map((row) => [row.key, row]));

/**
 * Queries to refresh after a dialog stores settings without reloading the
 * page, so badges and the overview show the new values and sources.
 */
export const SETTINGS_CHANGED_QUERIES = [
  { queryKey: ['SettingSources'] },
  { queryKey: ['SettingsOverrides'] },
];

/** Who wrote each stored setting, by key. Settings with no row are absent. */
export const useSettingSources = () => {
  const user = useUser();
  return useQuery({
    queryKey: ['SettingSources'],
    queryFn: () =>
      overrideSettingsSourcesList().then((response) => response.data),
    enabled: Boolean(checkIsStaffOrSupport(user)),
    select: byKey,
    staleTime: 60 * 1000,
  });
};

export const getLockedReason = (source?: SettingSource) =>
  source?.locked
    ? translate(
        'Managed by the deployment ({file}). Change it in the deployment configuration.',
        { file: source.managed_by },
      )
    : undefined;

/**
 * Set for a setting that a deploy writes again without locking it, such as
 * the Matrix settings: a change made here lasts until the next deploy.
 */
export const getReappliedNote = (source?: SettingSource) =>
  source && !source.locked && source.managed_by
    ? translate(
        'Re-applied by the deployment ({file}) on every deploy: a change made here is reverted then.',
        { file: source.managed_by },
      )
    : undefined;

/** Why each locked setting cannot be changed, by key. */
export const useLockedReasons = (): Record<string, string> => {
  const { data: sources } = useSettingSources();
  const reasons: Record<string, string> = {};
  for (const source of Object.values(sources ?? {})) {
    const reason = getLockedReason(source);
    if (reason) reasons[source.key] = reason;
  }
  return reasons;
};
