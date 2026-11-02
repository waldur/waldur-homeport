import { FC } from 'react';
import { NestedQoS } from 'waldur-js-client';

import { PropertyList, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

interface OwnProps {
  row: NestedQoS;
}

export const OfferingQoSExpandableRow: FC<OwnProps> = ({ row }) => (
  <ExpandableContainer alignRows>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-5">
      <div>
        <PropertyList variant="summary" space={1.5} hideIfEmpty={false}>
          <PropertyItem
            label={translate('Description')}
            value={row.description}
          />
          <PropertyItem
            label={translate('Minimum nodes per job')}
            value={row.min_nodes}
          />
          <PropertyItem
            label={translate('Default time limit (minutes)')}
            value={row.default_time}
          />
          <PropertyItem
            label={translate('Preemption grace time (seconds)')}
            value={row.grace_time}
          />
          <PropertyItem
            label={translate('Scheduling priority')}
            value={row.priority}
          />
        </PropertyList>
      </div>
      <div>
        <PropertyList variant="summary" space={1.5} hideIfEmpty={false}>
          <PropertyItem
            label={translate('Aggregate TRES (GrpTRES)')}
            value={row.grp_tres}
          />
          <PropertyItem
            label={translate('Max TRES per job')}
            value={row.max_tres_per_job}
          />
          <PropertyItem
            label={translate('Max TRES per node')}
            value={row.max_tres_per_node}
          />
          <PropertyItem
            label={translate('Max TRES per user')}
            value={row.max_tres_per_user}
          />
          <PropertyItem
            label={translate('Min TRES per job')}
            value={row.min_tres_per_job}
          />
          <PropertyItem
            label={translate('Max TRES-minutes per job')}
            value={row.max_tres_mins_per_job}
          />
          <PropertyItem label={translate('Flags')} value={row.flags} />
        </PropertyList>
      </div>
    </div>
  </ExpandableContainer>
);
