import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { renderFieldOrDash } from '@/table/utils';

export const SupportFeedbackListExpandableRow = ({ row }) => (
  <ExpandableContainer asTable>
    <Field
      label={translate('Comment')}
      value={renderFieldOrDash(row.comment)}
    />
  </ExpandableContainer>
);
