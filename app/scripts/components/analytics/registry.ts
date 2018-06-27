import { translate } from '@waldur/i18n';

export const registeredQuotas = {
  ram: {
    get label() { return translate('RAM'); },
  },
  volumes: {
    get label() { return translate('Volumes'); },
  },
  snapshots: {
    get label() { return translate('Snapshots'); },
  },
};

export const getRegisteredQuota = (quotaName: string) => registeredQuotas[quotaName];
