import { WarningCircleIcon, XIcon } from '@phosphor-icons/react';
import { useToggle } from 'react-use';

import { FeaturedIcon } from 'waldur-ui';

import { translate } from '@/i18n';

export const ResourceEndDateConflictBar = () => {
  const [show, toggle] = useToggle(true);

  if (!show) return null;

  return (
    <div className="bar bg-primary border-b-[1px] border-b-secondary h-60px">
      <div className="container-fluid w-full flex items-center gap-2">
        <FeaturedIcon
          icon={<WarningCircleIcon weight="bold" />}
          variant="warning"
          size="sm"
        />
        <p className="text-start text-xs">
          <strong className="font-medium">
            {translate('Date conflict.')}&nbsp;
          </strong>
          <span className="text-quaternary">
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
