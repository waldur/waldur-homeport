import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';

import { RemoteProjectAuditLog } from './RemoteProjectAuditLog';

export const AllRemoteProjectsAuditLog = () => {
  useTitle(translate('Remote Projects Audit Log'), '', 'browser');

  return <RemoteProjectAuditLog />;
};
