import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

export const NodeRoleField: FunctionComponent<{ node }> = ({ node }) => (
  <>
    {node.worker_role && node.etcd_role && node.controlplane_role
      ? translate('All')
      : [
          node.worker_role ? translate('worker') : '',
          node.etcd_role ? translate('etcd') : '',
          node.controlplane_role ? translate('control plane') : '',
        ]
          .filter(Boolean)
          .join(', ')}
  </>
);
