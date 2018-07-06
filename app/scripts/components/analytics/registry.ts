import { translate } from '@waldur/i18n';

export const registeredQuotas = {
  // tslint:disable-next-line
  ram: {
    get label() { return translate('Batch RAM usage, GB'); },
    formatter: x => Math.round(x / 1024),
  },
  // tslint:disable-next-line
  volumes: {
    get label() { return translate('Volume count'); },
  },
  // tslint:disable-next-line
  snapshots: {
    get label() { return translate('Snapshot size, GB'); },
    formatter: x => Math.round(x / 1024),
  },
};

export const getRegisteredQuota = (quotaName: string) => registeredQuotas[quotaName];
