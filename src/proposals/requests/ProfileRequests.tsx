import { FC, useCallback, useRef, useState } from 'react';

import { SegmentedControl, SegmentedControlOption } from 'waldur-ui';

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
  // The switcher is `actions` on whichever list is mounted. Changing the lens
  // unmounts that table, so the focused segment is destroyed. This flag is
  // consumed once by the new switcher's ref, which puts focus back on the
  // selected segment as it mounts.
  const restoreFocusRef = useRef(false);
  useTitle(requestListTitle());

  const options: SegmentedControlOption<View>[] = [
    { value: 'requests', label: requestViewLabel() },
    { value: 'resources', label: translate('By resource') },
  ];

  const restoreFocus = useCallback((node: HTMLDivElement | null) => {
    if (node && restoreFocusRef.current) {
      restoreFocusRef.current = false;
      node
        .querySelector<HTMLElement>('[role="radio"][aria-checked="true"]')
        ?.focus();
    }
  }, []);

  const handleValueChange = (next: View) => {
    restoreFocusRef.current = true;
    setView(next);
  };

  const switcher = (
    <SegmentedControl
      ref={restoreFocus}
      aria-label={translate('Group by')}
      options={options}
      value={view}
      onValueChange={handleValueChange}
      // lg to match the search box and toolbar buttons it sits beside. Both
      // hosts must agree: the requests view mounts it in the card toolbar, the
      // resources view in the page header, and an unset size would render 36px
      // in one and (before the control stopped stretching) 44px in the other.
      size="lg"
      itemClassName="px-6"
    />
  );

  // In the card toolbar beside search, not above the panel: this is a tab
  // inside the profile, and the standalone heading treatment is for a table
  // that owns its page (compare UserOfferingList on Remote accounts). Both
  // lenses, or the switcher resizes as you toggle: that header sizes up every
  // button in it.
  return view === 'requests' ? (
    <UserProposalsList actions={switcher} standalone={false} />
  ) : (
    <ResourceRequestsList actions={switcher} standalone={false} />
  );
};
