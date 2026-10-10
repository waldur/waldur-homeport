import { FC } from 'react';
import { OfferingComponent, ProviderPlanDetails } from 'waldur-js-client';

import { translate } from '@/i18n';
import { EmbeddedTabs } from '@/table/EmbeddedTabs';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { PlanComponentsTable } from './PlanComponentsTable';
import { PlanResourcesTable } from './PlanResourcesTable';

interface OwnProps {
  row: ProviderPlanDetails;
  components: OfferingComponent[];
}

export const PlanExpandableRow: FC<OwnProps> = (props) => (
  <ExpandableContainer>
    <EmbeddedTabs
      framed
      defaultValue="components"
      className="min-h-375px"
      tabs={[
        {
          key: 'components',
          title: translate('Components'),
          content: <PlanComponentsTable {...props} />,
        },
        {
          key: 'resources',
          title: translate('Resources'),
          content: <PlanResourcesTable {...props} />,
        },
      ]}
    />
  </ExpandableContainer>
);
