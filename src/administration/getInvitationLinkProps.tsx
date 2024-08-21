export const getInvitationLinkProps = (row) => {
  switch (row.scope_type) {
    case 'customer':
      return {
        state: 'organization.dashboard',
        params: { uuid: row.scope_uuid },
      };
    case 'project':
      return { state: 'project.dashboard', params: { uuid: row.scope_uuid } };
    case 'offering':
      return {
        state: 'admin-marketplace-offering-details',
        params: { offering_uuid: row.scope_uuid },
      };
    case 'call':
      return {
        state: 'public-call.details',
        params: { call_uuid: row.scope_uuid },
      };
    default:
      return null;
  }
};
