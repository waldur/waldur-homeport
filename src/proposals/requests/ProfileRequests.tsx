import { FC, useState } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';
import { requestListTitle, requestViewLabel } from '@/proposals/presentation';
import { UserProposalsList } from '@/proposals/proposal/UserProposalsList';

import { ResourceRequestsList } from './ResourceRequestsList';

type View = 'requests' | 'resources';

/**
 * The applicant's own requests, at either granularity.
 *
 * `My access requests` and `Resource requests` used to sit next to each other
 * in the profile, both ending in "requests" and differing only by a qualifier,
 * one being the submissions and the other the line items inside them. They
 * answer different questions and both are worth keeping: the request has a
 * lifecycle you act on (draft, submit, respond to an award), the resource is a
 * line item you track (how much, which offering, was it provisioned). So this
 * is one tab with two projections of the same data rather than a merge that
 * drops either.
 *
 * The view is component state, not a URL param: switching it is a lens, not a
 * destination, and a shared link should open on whichever view its recipient
 * last used rather than the sender's. Revisit if anyone wants to link a
 * colleague straight to the resource view.
 */
export const ProfileRequests: FC = () => {
  const [view, setView] = useState<View>('requests');
  useTitle(requestListTitle());

  // In the card toolbar beside search, not above the panel: this is a tab
  // inside the profile, and the standalone heading treatment is for a table
  // that owns its page (compare UserOfferingList on Remote accounts).
  const switcher = (
    <ToggleButtonGroup
      type="radio"
      name="requestsView"
      value={view}
      onChange={(value: View) => setView(value)}
    >
      <ToggleButton
        id="requests-view-requests"
        value="requests"
        variant="tertiary"
        className="px-6"
      >
        {requestViewLabel()}
      </ToggleButton>
      <ToggleButton
        id="requests-view-resources"
        value="resources"
        variant="tertiary"
        className="px-6"
      >
        {translate('By resource')}
      </ToggleButton>
    </ToggleButtonGroup>
  );

  return view === 'requests' ? (
    <UserProposalsList actions={switcher} standalone={false} />
  ) : (
    <ResourceRequestsList actions={switcher} />
  );
};
