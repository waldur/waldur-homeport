import { FC } from 'react';

import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';
import { Call } from '@/proposals/types';

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
    label: translate('Compliance checklist'),
    key: 'compliance_checklist',
    getValue: (call) =>
      call.compliance_checklist_name || translate('Not configured'),
    title: translate('Edit compliance checklist for proposal evaluation'),
  },
  {
    label: translate('Reviewer identity visible to applicants'),
    key: 'reviewer_identity_visible_to_submitters',
    getValue: (call) =>
      call.reviewer_identity_visible_to_submitters
        ? translate('Yes')
        : translate('No'),
    title: translate('Edit reviewer identity visibility for applicants'),
  },
  {
    label: translate('Reviews visible to applicants'),
    key: 'reviews_visible_to_submitters',
    getValue: (call) =>
      call.reviews_visible_to_submitters ? translate('Yes') : translate('No'),
    title: translate('Edit reviews visibility for applicants'),
  },
];

export const CallConfiguration: FC<CallConfigurationProps> = (props) => {
  // Filter compliance checklist configuration based on experimental UI toggle
  const filteredConfigRows = configRows.filter(
    (row) =>
      row.key !== 'compliance_checklist' || isExperimentalUiComponentsVisible(),
  );

  return (
    <>
      <FormTable.Card
        title={translate('General configuration')}
        className="card-bordered mb-5"
      >
        <FormTable>
          {filteredConfigRows.map((row) => (
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
