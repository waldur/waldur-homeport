import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { renderFieldOrDash } from '@waldur/table/utils';

export const SupportFeedbackListExpandableRow = ({ row }) => (
  <ExpandableContainer asTable>
    <Field
      label={translate('Comment')}
      value={renderFieldOrDash(row.comment)}
    />
  </ExpandableContainer>
);
