import { getCustomer } from '@/customer/utils';
import { useCustomer, useSetCustomer } from '@/workspace/hooks';

/**
 * Returns a callback that reloads the current workspace customer, so the
 * backend-computed `has_active_helpdesk` flag updates and the Helpdesk mode tab
 * appears/disappears without a page reload. Used after creating/deleting a
 * helpdesk.
 */
export const useRefreshWorkspaceCustomer = () => {
  const customer = useCustomer();
  const setCurrentCustomer = useSetCustomer();

  return async () => {
    if (customer) {
      setCurrentCustomer(await getCustomer(customer.uuid));
    }
  };
};
