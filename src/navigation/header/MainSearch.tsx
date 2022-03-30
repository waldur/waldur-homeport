import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';

export const MainSearch: FunctionComponent = () =>
  isFeatureVisible('mainSearch') ? (
    <div role="search" className="navbar-form-custom">
      <Form.Group>
        <Form.Control
          type="text"
          placeholder={translate('Search')}
          name="top-search"
          id="top-search"
        />
      </Form.Group>
    </div>
  ) : null;
