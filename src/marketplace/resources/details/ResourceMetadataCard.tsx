import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { ResourceSummaryBase } from '@/resource/summary';
import * as ResourceSummaryRegistry from '@/resource/summary/registry';

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
