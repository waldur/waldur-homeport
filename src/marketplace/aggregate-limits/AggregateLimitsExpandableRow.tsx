import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const AggregateLimitsExpandableRow = ({ data }) => {
  if (!data) return null;
  return (
    <ExpandableContainer>
      <Field label={translate('Type')} value={data.type} />
      <Field label={translate('Offering')} value={data.offering_name} />
      <Field label={translate('Unit')} value={data.measured_unit} />
    </ExpandableContainer>
  );
};
