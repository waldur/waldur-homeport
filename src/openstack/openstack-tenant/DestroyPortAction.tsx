import { validateState } from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';

import { destroyPort } from '../api';

const validators = [validateState('OK', 'Erred')];

export const DestroyPortAction = ({ resource }) => (
  <DestroyActionItem
    validators={validators}
    resource={resource}
    apiMethod={destroyPort}
  />
);
