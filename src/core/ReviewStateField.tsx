import {
  CheckIcon,
  ClockCountdownIcon,
  ProhibitIcon,
  XIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

/** States of anything using the backend's ReviewMixin. */
const reviewStates = {
  pending: {
    label: translate('Pending'),
    color: 'warning',
    icon: ClockCountdownIcon,
  },
  approved: { label: translate('Approved'), color: 'success', icon: CheckIcon },
  rejected: { label: translate('Rejected'), color: 'danger', icon: XIcon },
  // 'light', not 'secondary': secondary is green in this theme, which would
  // read as success for a withdrawn request.
  canceled: {
    label: translate('Canceled'),
    color: 'light',
    icon: ProhibitIcon,
  },
};

export const ReviewStateField: FC<{ state?: string }> = ({ state }) => {
  const status = reviewStates[state?.toLowerCase()];

  // An unrecognised state is shown verbatim rather than swallowed, so a new
  // backend state is visible here before this map catches up.
  if (!status) {
    return <>{renderFieldOrDash(state)}</>;
  }

  return (
    <Badge
      variant={status.color}
      leftIcon={<status.icon weight="bold" />}
      pill
      outline
    >
      {status.label}
    </Badge>
  );
};
