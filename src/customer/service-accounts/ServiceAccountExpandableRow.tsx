import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const ServiceAccountExpandableRow = ({ row }) => (
  <ExpandableContainer>
    <Field label={translate('Description')} value={row.description} />
  </ExpandableContainer>
);
