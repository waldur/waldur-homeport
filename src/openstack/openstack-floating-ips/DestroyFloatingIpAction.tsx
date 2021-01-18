import { validateState } from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';

import { destroyFloatingIP } from '../api';

const validators = [validateState('OK', 'Erred')];

export const DestroyFloatingIpAction = ({ resource }) => (
  <DestroyActionItem
    validators={validators}
    resource={resource}
    apiMethod={destroyFloatingIP}
  />
);
