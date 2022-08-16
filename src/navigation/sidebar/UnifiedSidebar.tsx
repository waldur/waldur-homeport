import { DocsLink } from '@waldur/navigation/header/DocsLink';

import { AdminMenu } from './AdminMenu';
import { ManagementMenu } from './ManagementMenu';
import { MarketplaceTrigger } from './marketplace-popup/MarketplaceTrigger';
import { ReportingMenu } from './ReportingMenu';
import { ResourcesMenu } from './ResourcesMenu';
import { Sidebar } from './Sidebar';
import { SupportMenu } from './SupportMenu';

export const UnifiedSidebar = () => {
  return (
    <Sidebar>
      <MarketplaceTrigger />
      <ResourcesMenu />
      <ManagementMenu />
      <ReportingMenu />
      <SupportMenu />
      <AdminMenu />
      <DocsLink />
    </Sidebar>
  );
};
