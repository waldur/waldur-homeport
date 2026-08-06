import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';

import { ManagedProjectAuditLog } from './ManagedProjectAuditLog';

export const AllManagedProjectsAuditLog = () => {
  useTitle(translate('Managed Projects Audit Log'), '', 'browser');

  return <ManagedProjectAuditLog />;
};
