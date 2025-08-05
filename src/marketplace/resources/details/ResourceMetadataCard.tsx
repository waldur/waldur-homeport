import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { ResourceSummaryBase } from '@waldur/resource/summary';
import * as ResourceSummaryRegistry from '@waldur/resource/summary/registry';

import { ResourceSummary } from './ResourceSummary';

export const ResourceMetadataCard = ({ resource, resourceScope: scope }) => {
  const configuration = ResourceSummaryRegistry.get(resource.resource_type);
  const SummaryComponent = configuration?.component || ResourceSummaryBase;

  return (
    <FormTable.Card
      title={translate('Resource details')}
      className="card-bordered"
    >
      <FormTable hideActions detailsMode>
        <ResourceSummary resource={resource} scope={scope}>
          {scope && <SummaryComponent resource={scope} formTableItem />}
        </ResourceSummary>
      </FormTable>
    </FormTable.Card>
  );
};
