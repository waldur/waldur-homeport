import { User } from 'waldur-js-client';

import { RootState } from '@/store/reducers';
import {
  checkIsStaffOrSupport,
  getCustomer,
  getUser,
} from '@/workspace/selectors';

import { PermissionEnum } from './enums';
import { hasConsumerPermission } from './hasPermission';

/**
 * May the user see the invoices of an organization?
 *
 * Mirrors the backend filter behind /api/invoices/: staff and support see
 * every invoice, and so does a site-wide role carrying INVOICE.LIST; anyone
 * else needs INVOICE.LIST from a role held on the organization itself. A role
 * on one of its projects or on its service provider does not count there, so
 * it does not count here either — the page would open on an empty list.
 */
export const canViewInvoices = (
  user: User | null | undefined,
  customerId: string | null | undefined,
): boolean => {
  if (!user) return false;
  if (checkIsStaffOrSupport(user)) return true;
  return hasConsumerPermission(user, {
    permission: PermissionEnum.LIST_INVOICES,
    customerId: customerId ?? undefined,
  });
};

/** Route predicate for the organization Invoices tab and invoice page. */
export const canViewCustomerInvoices = (state: RootState): boolean =>
  canViewInvoices(getUser(state), getCustomer(state)?.uuid);
