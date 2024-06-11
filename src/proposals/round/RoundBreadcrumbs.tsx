import { UISref } from '@uirouter/react';
import { Breadcrumb } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const RoundBreadcrumbs = ({ round, call }) => (
  <Breadcrumb>
    <UISref to="organizations">
      <Breadcrumb.Item>{translate('Organizations')}</Breadcrumb.Item>
    </UISref>
    <UISref to="organization.dashboard" params={{ uuid: call.customer_uuid }}>
      <Breadcrumb.Item>{call.customer_name}</Breadcrumb.Item>
    </UISref>
    <UISref
      to="call-management.call-list"
      params={{ uuid: call.customer_uuid }}
    >
      <Breadcrumb.Item>{translate('Calls for proposals')}</Breadcrumb.Item>
    </UISref>
    <UISref to="protected-call.main" params={{ call_uuid: call.uuid }}>
      <Breadcrumb.Item>{call.name}</Breadcrumb.Item>
    </UISref>
    <UISref
      to="protected-call.main"
      params={{ call_uuid: call.uuid, tab: 'rounds' }}
    >
      <Breadcrumb.Item>{translate('Rounds')}</Breadcrumb.Item>
    </UISref>
    <Breadcrumb.Item active>{round.name}</Breadcrumb.Item>
  </Breadcrumb>
);
