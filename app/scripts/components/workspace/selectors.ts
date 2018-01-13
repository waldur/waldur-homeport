import { createSelector } from 'reselect';

import { User, Customer, Project, OuterState } from './types';

export const getUser = (state: OuterState): User =>
  state.workspace.user;

export const getCustomer = (state: OuterState): Customer =>
  state.workspace.customer;

export const getProject = (state: OuterState): Project =>
  state.workspace.project;

export const isStaff = (state: OuterState): boolean =>
  getUser(state) && getUser(state).is_staff;

export const isOwnerOrStaff = createSelector(
  getUser,
  getCustomer,
  (user, customer) => {
    if (!user) {
      return false;
    }
    if (user.is_staff) {
      return true;
    }
    const isOwner = customer.owners.find(owner => owner.uuid === user.uuid) !== undefined;
    return isOwner;
  }
);

export const canManageCustomer = (state: any): boolean =>
  state.config.ownerCanManageCustomer;

export const canCreateOrganization = (state: OuterState): boolean =>
  isStaff(state) || canManageCustomer(state);

export const filterByUser = (state: OuterState) => ({
  user_url: getUser(state).url,
});
