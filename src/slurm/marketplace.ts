import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OfferingConfiguration } from '@waldur/marketplace/common/types';
import { SLURM_PLUGIN } from '@waldur/slurm/constants';

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
