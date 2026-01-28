import { PlusIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/core/config';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import './MarketplaceTrigger.scss';

const MarketplacePopup = lazyComponent(() =>
  import('./MarketplacePopup').then((module) => ({
    default: module.MarketplacePopup,
  })),
);

interface MarketplaceTriggerProps {
  disabled?: boolean;
  disabledTooltip?: string;
}

export const MarketplaceTrigger: FunctionComponent<MarketplaceTriggerProps> = ({
  disabled,
  disabledTooltip,
}) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(MarketplacePopup, {
          size: 'lg',
        }),
      ),
    [dispatch],
  );
  const sidebarStyle = ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE || 'dark';

  const trigger = (
    <div
      className={classNames('menu-item add-resource-toggle', {
        'menu-item-disabled': disabled,
      })}
    >
      <span
        className={classNames('menu-link btn btn-outline', {
          'btn-outline-white':
            sidebarStyle === 'dark' || sidebarStyle === 'primary',
          'btn-outline-primary': sidebarStyle === 'light',
        })}
        aria-hidden="true"
        onClick={disabled ? undefined : openFormDialog}
      >
        <span className="menu-icon justify-content-center">
          <span className="svg-icon svg-icon-2">
            <PlusIcon weight="bold" />
          </span>
        </span>
        <span className="menu-title">{translate('Add resource')}</span>
      </span>
    </div>
  );

  if (disabled && disabledTooltip) {
    return (
      <Tip label={disabledTooltip} id="marketplace-trigger">
        {trigger}
      </Tip>
    );
  }

  return trigger;
};
