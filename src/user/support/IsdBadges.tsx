import { FC } from 'react';

import { Badge } from '@waldur/core/Badge';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

/** Strip `isd:` prefix and capitalize first letter */
export const formatIsdName = (source: string): string => {
  const name = source.startsWith('isd:') ? source.slice(4) : source;
  return name.charAt(0).toUpperCase() + name.slice(1);
};

interface IsdBadgesProps {
  isds: string[];
  size?: 'sm' | 'lg';
}

export const IsdBadges: FC<IsdBadgesProps> = ({ isds, size }) => {
  if (!isds || isds.length === 0) {
    return <>{DASH_ESCAPE_CODE}</>;
  }
  return (
    <span className="d-inline-flex flex-wrap gap-1">
      {isds.map((isd) => (
        <Badge key={isd} variant="primary" size={size} pill outline>
          {formatIsdName(isd)}
        </Badge>
      ))}
    </span>
  );
};
