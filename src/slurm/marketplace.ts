import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OfferingConfiguration } from '@/marketplace/common/types';
import { SLURM_PLUGIN } from '@/slurm/constants';

const SlurmCredentialsForm = lazyComponent(() =>
  import('./SlurmCredentialsForm').then((module) => ({
    default: module.SlurmCredentialsForm,
  })),
);

const SlurmOrderForm = lazyComponent(() =>
  import('./SlurmOrderForm').then((module) => ({
    default: module.SlurmOrderForm,
  })),
);

export const SlurmOffering: OfferingConfiguration = {
  type: SLURM_PLUGIN,
  get label() {
    return translate('SLURM allocation');
  },
  orderFormComponent: SlurmOrderForm,
  credentialsForm: SlurmCredentialsForm,
};
