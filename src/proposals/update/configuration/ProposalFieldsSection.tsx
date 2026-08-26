import { QuestionIcon, WarningIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { proposalProtectedCallsPartialUpdate } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { Tip } from '@/core/Tooltip';
import FormTable from '@/form/FormTable';
import { Select } from '@/form/select/Select';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import {
  Call,
  ProposalFieldMetadata,
  ProposalFieldState,
  ProposalFieldUsage,
} from '@/proposals/types';
import { getCallReadOnlyReason } from '@/proposals/utils';

import {
  getFieldLabel,
  getStateLabel,
  getUsageLabel,
  getUsageTooltip,
  isConsequential,
} from './proposalFieldCopy';

interface ProposalFieldsSectionProps {
  call: Call;
  refetch: () => void;
  isReadOnly?: boolean;
}

const TITLE = (
  <>
    {translate('Project details fields')}{' '}
    <Tip
      id="proposal-fields-tip"
      label={translate(
        'Choose what this call asks applicants for. Name and project duration are always required. A field cannot be made required once the call has proposals.',
      )}
      className="mx-2 text-muted"
    >
      <QuestionIcon size={20} weight="fill" />
    </Tip>
  </>
);

/** The consumers a field feeds, so the cost of switching it off is visible here
 * rather than only in the backend it silently affects. */
const UsageList: FC<{ usage: ProposalFieldUsage[] }> = ({ usage }) => (
  <div className="d-flex flex-wrap gap-2">
    {usage.map((item) => {
      const tooltip = getUsageTooltip(item);
      const badge = (
        <Badge
          key={item}
          variant={isConsequential(item) ? 'warning' : 'gray'}
          outline
        >
          {isConsequential(item) && (
            <WarningIcon size={12} weight="bold" className="me-1" />
          )}
          {getUsageLabel(item)}
        </Badge>
      );
      return tooltip ? (
        <Tip key={item} id={`usage-${item}`} label={tooltip}>
          {badge}
        </Tip>
      ) : (
        badge
      );
    })}
  </div>
);

export const ProposalFieldsSection: FC<ProposalFieldsSectionProps> = ({
  call,
  refetch,
  isReadOnly,
}) => {
  const metadata = useMemo(
    () => (call.proposal_field_metadata ?? []) as ProposalFieldMetadata[],
    [call],
  );

  const { mutateAsync: update } = useManagedMutation({
    mutationFn: (body: Record<string, ProposalFieldState>) =>
      proposalProtectedCallsPartialUpdate({
        path: { uuid: call.uuid },
        body: { proposal_field_config: body },
      }),
    refetch,
    successMessage: translate('Project details fields have been updated.'),
    errorMessage: translate('Unable to update Project details fields.'),
    closeModal: false,
  });

  if (!metadata.length) {
    return null;
  }

  return (
    <FormTable.Card title={TITLE} className="card-bordered mb-5">
      <FormTable>
        {/* Always-on fields come first, so the list reads as the whole step
            rather than only the part that can be changed. */}
        <FormTable.Item
          label={translate('Name')}
          description={translate(
            'Names the proposal. The awarded project is named after the call and the round start date, followed by this name.',
          )}
          value={<Badge variant="gray">{getStateLabel('required')}</Badge>}
        />
        <FormTable.Item
          label={translate('Project duration in days')}
          description={translate(
            'States the length of the award, so it cannot be switched off.',
          )}
          value={<Badge variant="gray">{getStateLabel('required')}</Badge>}
        />
        {metadata.map((row) => {
          const options = row.allowed_states.map((state) => ({
            value: state,
            label: getStateLabel(state),
          }));
          const locked = Boolean(row.locked_reason);
          const select = (
            <Select
              inputId={`proposal-field-${row.field}`}
              options={options}
              value={{ value: row.state, label: getStateLabel(row.state) }}
              onChange={(option: { value: ProposalFieldState }) =>
                update({ [`field_${row.field}`]: option.value })
              }
              isDisabled={isReadOnly}
              isSearchable={false}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
            />
          );
          return (
            <FormTable.Item
              key={row.field}
              label={getFieldLabel(row.field)}
              htmlFor={`proposal-field-${row.field}`}
              description={<UsageList usage={row.usage} />}
              warnTooltip={
                isReadOnly
                  ? getCallReadOnlyReason(call)
                  : locked
                    ? row.locked_reason
                    : undefined
              }
              value={select}
            />
          );
        })}
      </FormTable>
    </FormTable.Card>
  );
};
