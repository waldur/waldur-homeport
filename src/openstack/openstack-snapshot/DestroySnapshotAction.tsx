import { validateState } from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';

import { destroySnapshot } from '../api';

const validators = [validateState('OK', 'Erred')];

export const DestroySnapshotAction = ({ resource }) => (
  <DestroyActionItem
    validators={validators}
    resource={resource}
    apiMethod={destroySnapshot}
  />
);
