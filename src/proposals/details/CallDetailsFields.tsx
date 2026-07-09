import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { renderFieldOrDash } from '@/table/utils';

export const CallDetailsFields = ({ call }) => {
  return (
    <>
      <Field
        label={translate('Reference code')}
        value={call.backend_id || <>&mdash;</>}
      />

      <Field
        label={translate('Publication date')}
        value={renderFieldOrDash(formatDateTime(call.start_date))}
      />
    </>
  );
};
