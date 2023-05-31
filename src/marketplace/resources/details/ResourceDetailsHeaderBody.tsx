import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

import { ResourceStateField } from '../list/ResourceStateField';
import { Resource } from '../types';

import { EndDateField, ProjectEndDateField } from './EndDateField';
import { OfferingDetailsField } from './OfferingDetailsField';
import { PlanDetailsField } from './PlanDetailsField';
import { ResourceMetadataLink } from './ResourceMetadataLink';
import { ResourceOrderItemsLink } from './ResourceOrderItemsLink';

interface ResourceDetailsHeaderBodyProps {
  resource: Resource;
  scope;
}

export const ResourceDetailsHeaderBody: FunctionComponent<ResourceDetailsHeaderBodyProps> =
  ({ resource, scope }) => {
    return (
      <>
        <Field
          label={translate('State')}
          value={<ResourceStateField row={resource} />}
        />
        <OfferingDetailsField resource={resource} />
        <PlanDetailsField resource={resource} />
        <EndDateField resource={resource} />
        <ProjectEndDateField resource={resource} />

        <div className="d-flex justify-content-between mt-3">
          <ResourceMetadataLink resource={resource} scope={scope} />
          <ResourceOrderItemsLink resource={resource} />
        </div>
      </>
    );
  };
