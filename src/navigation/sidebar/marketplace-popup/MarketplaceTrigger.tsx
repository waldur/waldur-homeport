import { Plus } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import './MarketplaceTrigger.scss';

const MarketplacePopup = lazyComponent(
  () => import('./MarketplacePopup'),
  'MarketplacePopup',
);

export const MarketplaceTrigger: FunctionComponent = () => {
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

  return (
    <div className="menu-item add-resource-toggle">
      <span
        className={classNames('menu-link btn btn-outline', {
          'btn-outline-white': sidebarStyle === 'dark',
          'btn-outline-primary': sidebarStyle === 'light',
        })}
        aria-hidden="true"
        onClick={openFormDialog}
      >
        <span className="menu-icon justify-content-center">
          <span className="svg-icon svg-icon-2">
            <Plus weight="bold" />
          </span>
        </span>
        <span className="menu-title">{translate('Add resource')}</span>
      </span>
    </div>
  );
};
