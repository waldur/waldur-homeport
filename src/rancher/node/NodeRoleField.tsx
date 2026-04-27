import { FunctionComponent } from 'react';

import { translate } from '@/i18n';

export const NodeRoleField: FunctionComponent<{ node }> = ({ node }) =>
  node.role === 'agent' ? translate('Agent') : translate('Server');
