import { WarningIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { useFormState } from 'react-final-form';
import { proposalProtectedCallsPartialUpdate } from 'waldur-js-client';

import {
  HelpIcon,
  PropertyCard,
  PropertyItem,
  PropertyList,
  Tooltip,
} from 'waldur-ui';
import { Badge } from 'waldur-ui';

import { EditFieldProvider, SelectEditField } from '@/form/editFields';
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
    <HelpIcon
      label={translate(
        'Choose what this call asks applicants for. Name and project duration are always required. A field cannot be made required once the call has proposals.',
      )}
      size={20}
      className="mx-1.5"
    />
  </>
);

/** A consumer turns into a warning only once the field is not asked, which is
 * when it actually loses its input. */
const UsageBadge: FC<{
  usage: ProposalFieldUsage;
  state: ProposalFieldState;
}> = ({ usage, state }) => {
  const warn = state === 'hidden' && isConsequential(usage);
  return (
    <Badge variant={warn ? 'warning' : 'neutral'} tone="outline">
      {warn && <WarningIcon size={12} weight="bold" className="me-1" />}
      {getUsageLabel(usage)}
    </Badge>
  );
};

/** The consumers a field feeds, so the cost of switching it off is visible here
 * rather than only in the backend it silently affects. The first one shows
 * and the rest sit behind "+N", unless `all` lists every one, as the edit
 * dialog does. */
const UsageList: FC<{
  usage: ProposalFieldUsage[];
  state: ProposalFieldState;
  all?: boolean;
}> = ({ usage, state, all }) => {
  if (!usage.length) {
    return null;
  }
  const sorted = [
    ...usage.filter(isConsequential),
    ...usage.filter((item) => !isConsequential(item)),
  ];
  if (all) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {sorted.map((item) => (
          <UsageBadge key={item} usage={item} state={state} />
        ))}
      </div>
    );
  }
  const [first, ...rest] = sorted;
  const hiddenLabels = rest.map(getUsageLabel).join(', ');
  return (
    <div className="flex flex-wrap gap-1.5">
      <UsageBadge usage={first} state={state} />
      {rest.length > 0 && (
        <Tooltip label={hiddenLabels}>
          {/* Focusable, so the hidden usages reach the keyboard and screen
              readers too: when the call is read-only nothing else lists them. */}
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
          <span tabIndex={0} role="img" aria-label={hiddenLabels}>
            <Badge variant="neutral" tone="outline">
              {translate('+{count} more', { count: rest.length })}
            </Badge>
          </span>
        </Tooltip>
      )}
    </div>
  );
};

/** In the edit dialog the badges follow the state being picked, so choosing
 * "Not asked" shows its cost before it is confirmed. */
const DialogUsageList: FC<{ usage: ProposalFieldUsage[] }> = ({ usage }) => {
  const { values } = useFormState<{ value: ProposalFieldState }>();
  return <UsageList usage={usage} state={values.value} all />;
};

export const ProposalFieldsSection: FC<ProposalFieldsSectionProps> = ({
  call,
  refetch,
  isReadOnly,
}) => {
  const metadata = useMemo(
    () => (call.proposal_field_metadata ?? []) as ProposalFieldMetadata[],
    [call],
  );

  // The states keyed as the update body expects them, for the edit fields.
  const scope = useMemo(
    () =>
      Object.fromEntries(
        metadata.map((row) => [`field_${row.field}`, row.state]),
      ),
    [metadata],
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
    <PropertyCard bordered title={TITLE} className="mb-4">
      <PropertyList>
        {/* Always-on fields come first, so the list reads as the whole step
            rather than only the part that can be changed. */}
        <PropertyItem
          label={translate('Name')}
          description={translate(
            'Names the proposal. The awarded project is named after the call and the round start date, followed by this name.',
          )}
          value={
            <Badge variant="neutral" tone="outline">
              {getStateLabel('required')}
            </Badge>
          }
        />
        <PropertyItem
          label={translate('Project duration in days')}
          description={translate(
            'States the length of the award, so it cannot be switched off.',
          )}
          value={
            <Badge variant="neutral" tone="outline">
              {getStateLabel('required')}
            </Badge>
          }
        />
        <EditFieldProvider
          scope={scope}
          callback={update}
          readOnlyReason={isReadOnly ? getCallReadOnlyReason(call) : undefined}
        >
          {metadata.map((row) => (
            <SelectEditField
              key={row.field}
              name={`field_${row.field}`}
              label={getFieldLabel(row.field)}
              description={<UsageList usage={row.usage} state={row.state} />}
              descriptionTooltip={false}
              dialogDescription={<DialogUsageList usage={row.usage} />}
              dialogSize="sm"
              options={row.allowed_states.map((state) => ({
                value: state,
                label: getStateLabel(state),
              }))}
              simpleValue
              isClearable={false}
              isSearchable={false}
              disabled={isReadOnly}
              warnTooltip={row.locked_reason || undefined}
              labelTooltip={row.usage.map(getUsageTooltip).find(Boolean)}
              renderValue={(state: ProposalFieldState) => (
                <Badge variant="neutral" tone="outline">
                  {getStateLabel(state)}
                </Badge>
              )}
            />
          ))}
        </EditFieldProvider>
      </PropertyList>
    </PropertyCard>
  );
};
