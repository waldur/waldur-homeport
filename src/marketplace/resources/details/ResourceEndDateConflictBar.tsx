import { WarningCircleIcon, XIcon } from '@phosphor-icons/react';
import { useToggle } from 'react-use';

import { RadarIcon } from '@waldur/core/RadarIcon';
import { translate } from '@waldur/i18n';

export const ResourceEndDateConflictBar = () => {
  const [show, toggle] = useToggle(true);

  if (!show) return null;

  return (
    <div className="bar bg-body border-bottom h-60px">
      <div className="container-fluid w-100 d-flex align-items-center gap-2">
        <RadarIcon
          IconComponent={WarningCircleIcon}
          variant="warning"
          size="sm"
        />
        <p className="text-start fs-7">
          <strong className="fw-bold">
            {translate('Date conflict.')}&nbsp;
          </strong>
          <span className="text-muted">
            {translate(
              'Termination date exceeds project end date. Resource termination will start from the project end date.',
            )}
          </span>
        </p>
        <button className="text-btn ms-auto" onClick={toggle}>
          <span className="svg-icon svg-icon-2">
            <XIcon weight="bold" />
          </span>
        </button>
      </div>
    </div>
  );
};
