import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';

export const SupportFeedbackListExpandableRow = ({ row }) => (
  <div className="container-fluid m-t">
    <dl className="dl-horizontal">
      <Field
        label={translate('Comment')}
        value={renderFieldOrDash(row.comment)}
      />
    </dl>
  </div>
);
