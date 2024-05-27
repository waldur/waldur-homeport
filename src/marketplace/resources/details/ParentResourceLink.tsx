import { UISref } from '@uirouter/react';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import openstackIcon from '@waldur/images/appstore/icon-openstack.png';

import { Resource } from '../types';

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
                to="marketplace-resource-details"
                params={{
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
  ) : (
    <p className="me-1"> </p>
  );
