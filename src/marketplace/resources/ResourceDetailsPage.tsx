import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state, ngInjector } from '@waldur/core/services';
import { useQuery } from '@waldur/core/useQuery';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { CreatedField } from '@waldur/resource/summary/CreatedField';
import { connectAngularComponent } from '@waldur/store/connect';

import { getResource } from '../common/api';
import { ResourceStateField } from './list/ResourceStateField';
import { Resource } from './types';

async function fetchResource(uuid) {
  const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
  const resource = await getResource(uuid);
  BreadcrumbsService.activeItem = resource.name;
  BreadcrumbsService.items = [
    {
      label: translate('Organization workspace'),
      state: 'organization.details',
      params: {
        uuid: resource.customer_uuid,
      },
    },
    {
      label: translate('Public resources'),
    },
  ];
  return resource;
}

export const ResourceDetailsPage = () => {
  const {state: resourceProps, call: loadResource} = useQuery(fetchResource, $state.params.resource_uuid);
  React.useEffect(loadResource, []);
  if (resourceProps.error && resourceProps.error.status === 404) {
    $state.go('errorPage.notFound');
    return;
  }
  if (!resourceProps.loaded) {
    return <LoadingSpinner/>;
  }
  const resource = resourceProps.data;
  return (
    <>
      <div className="row m-b-md">
        <dl className="dl-horizontal resource-details-table col-sm-12">
          <Field
            label={translate('State')}
            value={<ResourceStateField row={resource as Resource}/>}
          />
          <Field
            label={translate('Created')}
            value={<CreatedField resource={resource}/>}
          />
          <Field
            label={translate('UUID')}
            value={resource.uuid}
            valueClass="ellipsis"
          />
        </dl>
      </div>
      {resource.attributes.schedules && (
        <div className="row">
          <div className="col-lg-12">
            <Tabs defaultActiveKey="schedules" id="resource-details">
              <Tab eventKey="schedules" title={translate('Schedules')}>
                <div className="m-t-sm">
                  <Calendar events={resource.attributes.schedules}/>
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
};

export default connectAngularComponent(ResourceDetailsPage);
