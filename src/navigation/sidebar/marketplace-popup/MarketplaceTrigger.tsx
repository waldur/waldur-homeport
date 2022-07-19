import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { MarketplacePopup } from './MarketplacePopup';

export const MarketplaceTrigger: FunctionComponent = () => (
  <div className="aside-buttons flex-column-auto" id="kt_aside_buttons">
    <Button
      variant="link"
      className="btn-custom btn-active-primary btn-lg bg-transparent py-5 rounded-0 w-100"
      data-cy="marketplace-selector-toggle"
      data-kt-menu-trigger="click"
      data-kt-menu-attach=".page .header"
      data-kt-menu-placement="bottom-start"
      data-kt-menu-flip="bottom"
    >
      <span className="svg-icon svg-icon-2">
        <i className="fa fa-plus fs-2" />
      </span>
      <span className="btn-label">{translate('Add resource')}</span>
    </Button>

    <MarketplacePopup />
  </div>
);
