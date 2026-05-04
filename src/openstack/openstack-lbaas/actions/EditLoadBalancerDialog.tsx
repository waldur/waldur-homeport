import { FC } from 'react';
import { openstackLoadbalancersPartialUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { createNameField } from '@/resource/actions/base';
import { ActionDialogProps } from '@/resource/actions/types';
import { UpdateResourceDialog } from '@/resource/actions/UpdateResourceDialog';

export const EditLoadBalancerDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => (
  <UpdateResourceDialog
    fields={[createNameField()]}
    resource={resource}
    initialValues={{
      name: resource.name,
    }}
    updateResource={(uuid, body) =>
      openstackLoadbalancersPartialUpdate({ path: { uuid }, body })
    }
    verboseName={translate('load balancer')}
    refetch={refetch}
  />
);
