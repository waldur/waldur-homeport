import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';

import { translate } from '@/i18n';
import { ResourceUserInvitationsList } from '@/marketplace/resources/projects/ResourceUserInvitationsList';
import { ResourceUsersList } from '@/marketplace/resources/users/ResourceUsersList';

/**
 * Team tab on the resource detail page. Hosts two sub-tabs (Active /
 * Invitations) selected via the `?team_tab=` query param. The route
 * declares both `tab` and `team_tab` as dynamic, so changing them does
 * NOT unmount the surrounding ResourceDetailsPage — only this component
 * re-renders, swapping its body between the two lists. Card title stays
 * "Team" on both sub-tabs, matching the org-level /users/ page.
 */
export const ResourceTeamTab = (props) => {
  const { params } = useCurrentStateAndParams();
  const subTab = params.team_tab === 'invitations' ? 'invitations' : 'active';
  const tableTabs = useMemo(
    () => [
      {
        key: 'active',
        title: translate('Active'),
        params: { team_tab: 'active' },
      },
      {
        key: 'invitations',
        title: translate('Invitations'),
        params: { team_tab: 'invitations' },
      },
    ],
    [],
  );
  const sharedProps = {
    ...props,
    tableTabs,
    title: translate('Team'),
  };
  return subTab === 'invitations' ? (
    <ResourceUserInvitationsList {...sharedProps} />
  ) : (
    <ResourceUsersList {...sharedProps} />
  );
};
