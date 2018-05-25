import * as React from 'react';

import { Link } from '@waldur/core/Link';

export const ComparisonItemPlaceholder = () => (
  <td style={{
    width: '20%',
    verticalAlign: 'middle',
    textAlign: 'center',
  }}>
    <h3>
      <Link
        state="marketplace-landing"
        label={
          <>
            <i className="fa fa-plus-circle"/>
            {' '}
            Add item
          </>
        }
      />
    </h3>
  </td>
);
