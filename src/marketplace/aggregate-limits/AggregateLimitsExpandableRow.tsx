import { PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const AggregateLimitsExpandableRow = ({ data }) => {
  if (!data) return null;
  return (
    <ExpandableContainer>
      <PropertyList variant="summary">
        <PropertyItem label={translate('Type')} value={data.type} />
        <PropertyItem
          label={translate('Offering')}
          value={data.offering_name}
        />
        <PropertyItem label={translate('Unit')} value={data.measured_unit} />
      </PropertyList>
    </ExpandableContainer>
  );
};
