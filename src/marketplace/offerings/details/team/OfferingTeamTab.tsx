import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useMemo } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { translate } from '@/i18n';

import { OfferingInvitationsList } from './OfferingInvitationsList';
import { OfferingUsersList } from './OfferingUsersList';

/**
 * Team tab on the provider offering detail page. Sub-tabs are selected via the
 * `?team_tab=` query param; the route declares both `tab` and `team_tab` as
 * dynamic, so switching them does NOT unmount the surrounding offering page —
 * only this component re-renders. Mirrors `ResourceTeamTab`, which does the
 * same for marketplace resources.
 */
export const OfferingTeamTab: FC<{ offering: Offering }> = (props) => {
  const { params } = useCurrentStateAndParams();
  const subTab = params.team_tab === 'invitations' ? 'invitations' : 'active';

  const tableTabs = useMemo(
    () => [
      {
        key: 'active',
        title: translate('Active'),
        params: { team_tab: 'active' },
        // Landing on ?tab=permissions carries no team_tab, so TableTabs finds
        // no param match and would highlight neither tab. `default` is its
        // fallback for exactly that case.
        default: true,
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
    <OfferingInvitationsList {...sharedProps} />
  ) : (
    <OfferingUsersList {...sharedProps} />
  );
};
