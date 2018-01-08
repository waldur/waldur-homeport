import { pick } from '@waldur/core/utils';
import * as ProvidersRegistry from '@waldur/providers/registry';

import { SlurmForm } from './SlurmForm';

ProvidersRegistry.register({
  name: 'SLURM',
  type: 'SLURM',
  icon: 'icon-slurm.png',
  endpoint: 'slurm',
  component: SlurmForm,
  serializer: pick([
    'hostname',
    'username',
    'port',
    'gateway',
    'use_sudo',
    'default_account',
  ]),
});
