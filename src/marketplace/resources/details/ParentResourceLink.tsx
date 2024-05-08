import { UISref } from '@uirouter/react';

import { formatJsxTemplate, translate } from '@waldur/i18n';

import { Resource } from '../types';

const openstackIcon = require('@waldur/images/appstore/icon-openstack.png');

export const ParentResourceLink = ({ resource }: { resource: Resource }) =>
  resource.parent_uuid && resource.parent_name ? (
    <p>
      <i>
        <img src={openstackIcon} width={15} className="me-1" alt="openstack" />
        {translate(
          'Part of {resource}',
          {
            resource: (
              <UISref
                to="marketplace-project-resource-details"
                params={{
                  uuid: resource.project_uuid,
                  resource_uuid: resource.parent_uuid,
                }}
              >
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a className="text-btn">{resource.parent_name}</a>
              </UISref>
            ),
          },
          formatJsxTemplate,
        )}
      </i>
    </p>
  ) : null;
