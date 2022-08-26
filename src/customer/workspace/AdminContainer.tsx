import { UIView } from '@uirouter/react';

import { useAdminItems } from '@waldur/navigation/navitems';

export const AdminContainer = () => {
  useAdminItems();
  return <UIView />;
};
