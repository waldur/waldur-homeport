import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const ResourceCreateExpandableRow = ({ row }) => (
  <dl className="dl-horizontal col-sm-12">
    <Field label={translate('Resource name')} value={row.name} />
    <Field label={translate('Description')} value={row.description} />
    {row.end_date && (
      <Field
        label={translate('Termination date')}
        value={formatDate(row.end_date)}
      />
    )}
  </dl>
);
