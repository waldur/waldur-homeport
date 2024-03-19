import { formatRelative } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

import { Round } from '../types';

interface RoundPageHeaderBodyProps {
  round: Round;
}

export const RoundPageHeaderBody = (props: RoundPageHeaderBodyProps) => {
  return (
    <p className="fw-bold">
      {translate('Open round ends in')}:{' '}
      <span className="text-danger">
        {formatRelative(props.round.cutoff_time)}
      </span>
    </p>
  );
};
