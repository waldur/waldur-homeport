import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

export const NodeRoleField: FunctionComponent<{ node }> = ({ node }) =>
  node.role === 'agent' ? translate('Agent') : translate('Server');
