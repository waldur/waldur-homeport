import { useIsActive } from '@uirouter/react';
import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

import { MarketplacePopup } from './MarketplacePopup';

export const MarketplaceTrigger: FunctionComponent = () => {
  const isActive = useIsActive('marketplace-offering-public');
  return (
    <div
      className={classNames('menu-item', { here: isActive })}
      data-kt-menu-trigger="click"
      data-kt-menu-attach=".page .header"
      data-kt-menu-placement="bottom-start"
      data-kt-menu-flip="bottom"
    >
      <span className="menu-link">
        <span className="menu-icon justify-content-center">
          <span className="svg-icon svg-icon-2">
            <i className="fa fa-plus fs-2" />
          </span>
        </span>
        <span className="menu-title">{translate('Add resource')}</span>
      </span>
      <MarketplacePopup />
    </div>
  );
};
