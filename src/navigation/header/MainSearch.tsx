import * as React from 'react';

import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';

export const MainSearch = () =>
  isFeatureVisible('mainSearch') ? (
    <div role="search" className="navbar-form-custom">
      <div className="form-group">
        <input
          type="text"
          placeholder={translate('Search')}
          className="form-control"
          name="top-search"
          id="top-search"
        />
      </div>
    </div>
  ) : null;
