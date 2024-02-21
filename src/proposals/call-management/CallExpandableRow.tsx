import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ProposalCall } from '@waldur/proposals/types';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';

export const CallExpandableRow: FunctionComponent<{
  row: ProposalCall;
}> = ({ row }) => (
  <>
    <Field
      label={translate('Next cutoff')}
      value={renderFieldOrDash(formatDateTime(row.end_time))}
    />
    <Field label={translate('Review strategy')} value={row.review_strategy} />
    <Field label={translate('Round strategy')} value={row.round_strategy} />
    <Field label={translate('Submissions')} value="32" />
    <Field label={translate('Pending review')} value="22" />
    <Field
      label={translate('Resource availability')}
      value="44.54/100 % (i)"
      className="text-nowrap"
    />
  </>
);
