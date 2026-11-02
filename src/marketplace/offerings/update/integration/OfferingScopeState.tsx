import { CoreStates } from 'waldur-js-client';

import { BadgeVariant, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

/**
 * Each scope state as a badge, keyed by the API enum so a state the backend
 * adds fails to compile. The labels are the states themselves, as this row
 * has always shown them; `missing` is the offering with no scope at all.
 */
const SCOPE_STATES: Record<
  CoreStates | 'missing',
  { label: string; variant: BadgeVariant }
> = {
  OK: { label: 'OK', variant: 'success' },
  ERRED: { label: 'ERRED', variant: 'danger' },
  CREATION_SCHEDULED: { label: 'CREATION_SCHEDULED', variant: 'warning' },
  CREATING: { label: 'CREATING', variant: 'warning' },
  UPDATE_SCHEDULED: { label: 'UPDATE_SCHEDULED', variant: 'warning' },
  UPDATING: { label: 'UPDATING', variant: 'warning' },
  DELETION_SCHEDULED: { label: 'DELETION_SCHEDULED', variant: 'warning' },
  DELETING: { label: 'DELETING', variant: 'warning' },
  missing: { label: 'MISSING', variant: 'secondary' },
};

export const OfferingScopeState = ({
  state,
}: {
  state?: CoreStates | null;
}) => (
  <PropertyItem
    label={translate('State')}
    value={propVal.state(state ?? 'missing', {
      states: SCOPE_STATES,
      testId: 'offering-scope-state',
    })}
    // End-to-end tests read the state from the badge alone.
  />
);
