import { validateState } from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { destroyPort } from '../api';

const validators = [validateState('OK', 'Erred')];

export const DestroyPortAction: ActionItemType = ({ resource, refetch }) => (
  <DestroyActionItem
    validators={validators}
    resource={resource}
    apiMethod={destroyPort}
    refetch={refetch}
  />
);
