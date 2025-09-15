import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

export const CourseAccountExpandableRow = ({ row }) => (
  <ExpandableContainer>
    <Field label={translate('Description')} value={row.description} />
  </ExpandableContainer>
);
