import { translate } from '@waldur/i18n';

export const registeredQuotas = {
  ['nc_ram_usage']: {
    feature: 'storage',
    get label() { return translate('RAM'); },
  },
  ['nc_volume_count']: {
    feature: 'storage',
    get label() { return translate('Volumes'); },
  },
  ['nc_snapshot_size']: {
    feature: 'apps',
    get label() { return translate('Snapshots'); },
  },
};

export const getRegisteredQuota = (quotaName: string) => registeredQuotas[quotaName];
