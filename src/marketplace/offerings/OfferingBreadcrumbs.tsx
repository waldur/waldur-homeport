import { UISref } from '@uirouter/react';
import { Breadcrumb } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const OfferingBreadcrumbs = ({ offering }) => (
  <Breadcrumb>
    <UISref to="organizations">
      <Breadcrumb.Item>{translate('Organizations')}</Breadcrumb.Item>
    </UISref>
    <UISref
      to="organization.dashboard"
      params={{ uuid: offering.customer_uuid }}
    >
      <Breadcrumb.Item>{offering.customer_name}</Breadcrumb.Item>
    </UISref>
    <UISref
      to="marketplace-vendor-offerings"
      params={{ uuid: offering.customer_uuid }}
    >
      <Breadcrumb.Item>{translate('Offerings')}</Breadcrumb.Item>
    </UISref>
    <Breadcrumb.Item active>{offering.name}</Breadcrumb.Item>
  </Breadcrumb>
);
