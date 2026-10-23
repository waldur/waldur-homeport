import { describe, expect, it, vi } from 'vitest';
import {
  callManagingOrganisationsAddUser,
  customersAddUser,
  marketplaceProviderOfferingsAddUser,
  marketplaceServiceProvidersAddUser,
  projectsAddUser,
  proposalProposalsAddUser,
  proposalProtectedCallsAddUser,
} from 'waldur-js-client';

import { grantUserRole, GrantableScopeType } from './grantUserRole';

const BODY = { user: 'user-uuid', role: 'PROJECT.MEMBER' };

const cases: [GrantableScopeType, typeof customersAddUser][] = [
  ['customer', customersAddUser],
  ['project', projectsAddUser],
  ['offering', marketplaceProviderOfferingsAddUser],
  ['call', proposalProtectedCallsAddUser],
  ['proposal', proposalProposalsAddUser],
  ['service_provider', marketplaceServiceProvidersAddUser],
  ['call_organizer', callManagingOrganisationsAddUser],
];

describe('grantUserRole', () => {
  it.each(cases)(
    'grants a %s role through that scope add_user',
    (scopeType, addUser) => {
      grantUserRole(scopeType, 'scope-uuid', BODY);

      expect(addUser).toHaveBeenCalledWith({
        path: { uuid: 'scope-uuid' },
        body: BODY,
      });
    },
  );

  it('does not call a different scope endpoint', () => {
    vi.mocked(customersAddUser).mockClear();
    grantUserRole('project', 'scope-uuid', BODY);
    expect(customersAddUser).not.toHaveBeenCalled();
  });
});
