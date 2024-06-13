import { UISref } from '@uirouter/react';
import { Breadcrumb } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ResourcePopoverToggle } from './ResourcePopoverToggle';

export const ResourceBreadcrumbs = ({ resource }) => {
  if (!resource) {
    return null;
  }
  return (
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
      <UISref
        to="project.resources"
        params={{
          uuid: resource.project_uuid,
        }}
      >
        <Breadcrumb.Item>{resource.category_title}</Breadcrumb.Item>
      </UISref>
      <ResourcePopoverToggle resource={resource} />
    </Breadcrumb>
  );
};
