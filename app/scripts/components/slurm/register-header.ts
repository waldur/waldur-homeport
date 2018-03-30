import * as registry from '@waldur/resource/resource-configuration';
import { translate } from '@waldur/i18n';

const getHeader = resource =>
  resource.batch_service === 'MOAB' ?
  translate('MOAB allocation') :
  translate('SLURM allocation');

registry.register('SLURM.Allocation', {
  getHeader,
});
