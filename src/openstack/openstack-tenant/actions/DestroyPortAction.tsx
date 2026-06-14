import { OpenStackPort, openstackPortsDestroy } from 'waldur-js-client';

import { validateState } from '@/resource/actions/base';
import { DestroyActionItem } from '@/resource/actions/DestroyActionItem';
import { ActionItemType } from '@/resource/actions/types';

import { getPortCategory } from '../portCategories';

const validators = [validateState('OK', 'ERRED')];

export const DestroyPortAction: ActionItemType<OpenStackPort> = ({
  resource,
  refetch,
}) => {
  const warning = getPortCategory(resource.device_owner)?.warning;
  return (
    <DestroyActionItem
      validators={validators}
      resource={resource}
      apiMethod={(id) => openstackPortsDestroy({ path: { uuid: id } })}
      refetch={refetch}
      dialogSubtitle={
        warning ? (
          <p className="text-danger fw-bold mt-4 mb-0">{warning}</p>
        ) : undefined
      }
    />
  );
};
