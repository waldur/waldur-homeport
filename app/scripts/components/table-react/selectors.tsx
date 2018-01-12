interface User {
  is_staff: boolean;
  url: string;
  uuid: string;
}

export const getCurrentUser = (state: any): User => state.currentUser;

export const filterByUser = state => ({
  user_url: getCurrentUser(state).url,
});

export const isStaff = state => state.currentUser && state.currentUser.is_staff;

export const canManageCustomer = state => state.config.ownerCanManageCustomer;

export const canCreateOrganization = state => isStaff(state) || canManageCustomer(state);
