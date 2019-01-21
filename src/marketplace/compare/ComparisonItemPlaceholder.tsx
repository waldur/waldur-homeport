import * as React from 'react';

import { translate } from '@waldur/i18n';
import { LandingLink } from '@waldur/marketplace/links/LandingLink';

export const ComparisonItemPlaceholder = () => (
  <td style={{
    width: 230,
    verticalAlign: 'middle',
    textAlign: 'center',
  }}>
    <h3>
      <LandingLink>
        <i className="fa fa-plus-circle"/>
        {' '}
        {translate('Add item')}
      </LandingLink>
    </h3>
  </td>
);
