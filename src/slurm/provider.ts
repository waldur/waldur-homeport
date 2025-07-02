import { lazyComponent } from '@waldur/core/lazyComponent';
import icon from '@waldur/images/appstore/icon-slurm.png';
import { ProviderConfig } from '@waldur/marketplace/offerings/update/integration/types';

const SlurmForm = lazyComponent(() =>
  import('./SlurmForm').then((module) => ({ default: module.SlurmForm })),
);

export const SlurmProviderConfig: ProviderConfig = {
  name: 'Batch processing',
  type: 'SLURM',
  icon,
  component: SlurmForm,
};
