import { FC } from 'react';
import { openportalAllocationsSetLimits } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionDialogProps, ActionField } from '@/resource/actions/types';
import { UpdateResourceDialog } from '@/resource/actions/UpdateResourceDialog';

const getFields = (): ActionField[] => [
  {
    name: 'node_limit',
    type: 'integer',
    required: true,
    label: translate('Node limit'),
  },
];

export const SetLimitsDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => (
  <UpdateResourceDialog
    fields={getFields()}
    resource={resource}
    initialValues={{ node_limit: resource.node_limit }}
    updateResource={(uuid, { node_limit }) =>
      openportalAllocationsSetLimits({
        path: { uuid },
        body: { node_limit: Math.ceil(node_limit) },
      })
    }
    verboseName={translate('OpenPortal allocation')}
    refetch={refetch}
  />
);
