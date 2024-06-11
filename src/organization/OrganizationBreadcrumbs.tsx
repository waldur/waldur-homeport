import { UISref } from '@uirouter/react';
import { Breadcrumb } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const OrganizationBreadcrumbs = ({ customer }) => (
  <Breadcrumb>
    <UISref to="organizations">
      <Breadcrumb.Item>{translate('Organizations')}</Breadcrumb.Item>
    </UISref>
    <Breadcrumb.Item active>{customer.name}</Breadcrumb.Item>
  </Breadcrumb>
);
