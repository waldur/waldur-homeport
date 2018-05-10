import { translate } from '@waldur/i18n';

export const registeredQuotas = {
  // tslint:disable-next-line
  nc_ram_usage: {
    get label() { return translate('RAM'); },
  },
  // tslint:disable-next-line
  nc_volume_count: {
    get label() { return translate('Volumes'); },
  },
  // tslint:disable-next-line
  nc_snapshot_size: {
    get label() { return translate('Snapshots'); },
  },
};

export const getRegisteredQuota = (quotaName: string) => registeredQuotas[quotaName];
