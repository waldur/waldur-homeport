import type { MicroAppSetting } from 'waldur-js-client';

import type { MicroAppEntry } from 'waldur-shell';

import { translate } from '@/i18n';

export const MICRO_APP_SETTINGS_QUERY_KEY = ['micro-app-settings'];

/** Who an app is offered to: an operator mode, or the global feature. */
export type MicroAppChoice = NonNullable<MicroAppSetting['mode']> | 'feature';

/** One row of the Micro-apps page: an app in the image, a setting, or both. */
export interface MicroAppRow {
  name: string;
  title: string;
  description: string;
  /** Whether this portal's image holds the app. */
  deployed: boolean;
  setting?: MicroAppSetting;
}

/**
 * The apps the image holds (micro-apps.json) joined with the operator's
 * settings, which may name an app the image no longer has.
 */
export const joinMicroApps = (
  registry: MicroAppEntry[],
  settings: MicroAppSetting[],
): MicroAppRow[] => {
  const byName = new Map(settings.map((setting) => [setting.name, setting]));
  const rows: MicroAppRow[] = registry.map((app) => ({
    name: app.name,
    title: app.title,
    description: app.description,
    deployed: true,
    setting: byName.get(app.name),
  }));
  const deployed = new Set(registry.map((app) => app.name));
  for (const setting of settings) {
    if (!deployed.has(setting.name)) {
      rows.push({
        name: setting.name,
        title: setting.name,
        description: '',
        deployed: false,
        setting,
      });
    }
  }
  return rows.sort((a, b) => a.title.localeCompare(b.title));
};

export const choiceOf = (row: MicroAppRow): MicroAppChoice =>
  row.setting ? (row.setting.mode ?? 'off') : 'feature';

export const getChoiceLabel = (choice: MicroAppChoice) =>
  ({
    feature: translate('Follows the micro-apps feature'),
    off: translate('Off'),
    all: translate('Everyone'),
    audience: translate('Selected users'),
  })[choice];
