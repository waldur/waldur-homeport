import { DocsLink } from '@waldur/navigation/header/DocsLink';

import { AdminMenu } from './AdminMenu';
import { ManagementMenu } from './ManagementMenu';
import { ReportingMenu } from './ReportingMenu';
import { ResourcesMenu } from './ResourcesMenu';
import { Sidebar } from './Sidebar';
import { SupportMenu } from './SupportMenu';

export const UnifiedSidebar = () => {
  return (
    <Sidebar>
      <ResourcesMenu />
      <ManagementMenu />
      <ReportingMenu />
      <SupportMenu />
      <AdminMenu />
      <DocsLink />
    </Sidebar>
  );
};
