import { UISref } from '@uirouter/react';
import { Breadcrumb } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const ResourceBreadcrumbs = ({ resource }) =>
  resource ? (
    <Breadcrumb>
      <UISref to="organizations">
        <Breadcrumb.Item>{translate('Organizations')}</Breadcrumb.Item>
      </UISref>
      <UISref
        to="organization.dashboard"
        params={{ uuid: resource.customer_uuid }}
      >
        <Breadcrumb.Item>{resource.customer_name}</Breadcrumb.Item>
      </UISref>
      <UISref
        to="organization.projects"
        params={{ uuid: resource.customer_uuid }}
      >
        <Breadcrumb.Item>{translate('Projects')}</Breadcrumb.Item>
      </UISref>
      <UISref to="project.dashboard" params={{ uuid: resource.project_uuid }}>
        <Breadcrumb.Item>{resource.project_name}</Breadcrumb.Item>
      </UISref>
      <UISref to="project.resources" params={{ uuid: resource.project_uuid }}>
        <Breadcrumb.Item>{translate('Resources')}</Breadcrumb.Item>
      </UISref>
      <Breadcrumb.Item active>{resource.name}</Breadcrumb.Item>
    </Breadcrumb>
  ) : null;
