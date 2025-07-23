import { FC } from 'react';

import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { Call } from '@waldur/proposals/types';

import { EditGeneralInfoButton } from '../general/EditGeneralInfoButton';

import { CallResourceTemplates } from './CallResourceTemplates';

interface CallConfigurationProps {
  call: Call;
  refetch;
}

const configRows = [
  {
    label: translate('Fixed duration'),
    key: 'fixed_duration_in_days',
    getValue: (call) =>
      call.fixed_duration_in_days
        ? translate('{n} days', {
            n: call.fixed_duration_in_days,
          })
        : 'N/A',
    title: translate('Edit fixed duration for granted projects (in days)'),
  },
  {
    label: translate('Reviewer identity visible to submitters'),
    key: 'reviewer_identity_visible_to_submitters',
    getValue: (call) =>
      call.reviewer_identity_visible_to_submitters
        ? translate('Yes')
        : translate('No'),
    title: translate('Edit reviewer identity visibility for submitters'),
  },
  {
    label: translate('Reviews visible to submitters'),
    key: 'reviews_visible_to_submitters',
    getValue: (call) =>
      call.reviews_visible_to_submitters ? translate('Yes') : translate('No'),
    title: translate('Edit reviews visibility for submitters'),
  },
];

export const CallConfiguration: FC<CallConfigurationProps> = (props) => {
  return (
    <>
      <FormTable.Card
        title={translate('General configuration')}
        className="card-bordered mb-5"
      >
        <FormTable>
          {configRows.map((row) => (
            <FormTable.Item
              label={row.label}
              value={row.getValue(props.call)}
              actions={
                <EditGeneralInfoButton
                  call={props.call}
                  name={row.key}
                  title={row.title}
                  refetch={props.refetch}
                />
              }
            />
          ))}
        </FormTable>
      </FormTable.Card>

      <CallResourceTemplates call={props.call} />
    </>
  );
};
