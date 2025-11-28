import { FunctionComponent } from 'react';

import { Badge } from '@waldur/core/Badge';

interface ChangedLimitFieldProps {
  changedLimit: number;
}

export const ChangedLimitField: FunctionComponent<ChangedLimitFieldProps> = ({
  changedLimit,
}) => {
  if (changedLimit === 0) {
    return <span className="text-muted">{changedLimit}</span>;
  }

  const variant = changedLimit < 0 ? 'danger' : 'success';
  const displayValue =
    changedLimit > 0 ? `+${changedLimit}` : String(changedLimit);

  return (
    <Badge variant={variant} pill outline>
      {displayValue}
    </Badge>
  );
};
