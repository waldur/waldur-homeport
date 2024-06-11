import { UISref } from '@uirouter/react';
import { Breadcrumb } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const ProjectBreadcrumbs = ({ project }) => (
  <Breadcrumb>
    <UISref to="organizations">
      <Breadcrumb.Item>{translate('Organizations')}</Breadcrumb.Item>
    </UISref>
    <UISref
      to="organization.dashboard"
      params={{ uuid: project.customer_uuid }}
    >
      <Breadcrumb.Item>{project.customer_name}</Breadcrumb.Item>
    </UISref>
    <UISref to="organization.projects" params={{ uuid: project.customer_uuid }}>
      <Breadcrumb.Item>{translate('Projects')}</Breadcrumb.Item>
    </UISref>
    <Breadcrumb.Item active>{project.name}</Breadcrumb.Item>
  </Breadcrumb>
);
