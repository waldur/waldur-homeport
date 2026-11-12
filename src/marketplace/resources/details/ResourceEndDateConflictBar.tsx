import { WarningCircleIcon, XIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useToggle } from 'react-use';

import { FeaturedIcon } from 'waldur-ui';

import { translate } from '@/i18n';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';

export const ResourceEndDateConflictBar = () => {
  const [show, toggle] = useToggle(true);

  if (!show) return null;

  return (
    <div className="bg-primary border-b border-b-secondary h-[60px]">
      <div
        className={classNames(
          PAGE_CONTAINER_CLASSNAME,
          'w-full flex items-center gap-1.5',
        )}
      >
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
        <button
          type="button"
          className="bg-transparent border-0 p-0 m-0 cursor-pointer text-quaternary hover:text-secondary ms-auto inline-flex items-center"
          onClick={toggle}
          aria-label={translate('Dismiss')}
        >
          <XIcon size={20} weight="bold" />
        </button>
      </div>
    </div>
  );
};
