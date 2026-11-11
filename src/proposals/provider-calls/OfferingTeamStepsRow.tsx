import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  OfferingTeamStep,
  proposalRequestedOfferingsTeamRetrieve,
  proposalRequestedOfferingsTeamStepSlotsList,
  proposalRequestedOfferingsTeamStepsList,
  ProviderRequestedOffering,
} from 'waldur-js-client';

import { AlertItem, PropertyItem, PropertyList } from 'waldur-ui';

import { Link } from '@/core/Link';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ROW_SECTIONS_CLASS, RowSection } from '@/proposals/ExpandableRowParts';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { useUser } from '@/workspace/hooks';

import { callFilterParam } from './offeringDemand';
import {
  getTeamPeople,
  needsOfferingManagers,
  offeringTeamLink,
  phaseLabel,
  stepDoerText,
} from './providerCalls';
import { TeamSlotsTable } from './TeamSlotsTable';

/**
 * "This call needs your offering managers": the warning when the offering's
 * team is empty, with the way to its Team tab where the viewer may manage it.
 */
const OfferingManagersNeeded: FC<{
  row: ProviderRequestedOffering;
  providerUuid: string;
}> = ({ row, providerUuid }) => {
  const user = useUser();
  if (!needsOfferingManagers(row)) {
    return null;
  }
  const canManageTeam = hasPermission(user, {
    permission: PermissionEnum.CREATE_OFFERING_PERMISSION,
    offeringId: row.offering_uuid,
    customerId: providerUuid,
  });
  const link = offeringTeamLink(providerUuid, row.offering_uuid);
  return (
    <AlertItem
      type="floating"
      variant="error"
      title={translate('Nobody can do {offering}’s part in this call', {
        offering: row.offering_name,
      })}
      body={translate(
        'Add offering managers on the offering’s Team tab; the call can’t invite them, and organization owners don’t count.',
      )}
      actions={
        canManageTeam ? (
          <Link
            state={link.state}
            params={link.params}
            label={translate('Add offering managers')}
            buttonVariant="primary"
            buttonSize="sm"
          />
        ) : null
      }
    />
  );
};

/** One row per step the call gives the offering's team: what it is, when
 * it runs, how long it takes and who does it. */
const TeamStepsSummary: FC<{
  steps: OfferingTeamStep[];
  offeringName: string;
}> = ({ steps, offeringName }) => (
  <RowSection
    title={translate('Your team’s steps')}
    data-testid="offering-team-steps"
  >
    {steps.length ? (
      <PropertyList variant="summary" space={1.5}>
        {steps.map((step) => (
          <PropertyItem
            key={step.uuid}
            label={step.name}
            value={[
              phaseLabel(step.phase),
              step.duration_in_days
                ? translate('{days} days', { days: step.duration_in_days })
                : null,
              stepDoerText(step, offeringName),
            ]
              .filter(Boolean)
              .join(' · ')}
          />
        ))}
      </PropertyList>
    ) : (
      <p className="text-tertiary mb-0">
        {translate(
          'The call’s workflow gives the offering’s team no step of its own.',
        )}
      </p>
    )}
  </RowSection>
);

/**
 * What the call asks of the offering's team now: the steps it has, and one
 * list of what is open on them, to hand on where a step allows. Who is on the
 * team lives on the offering's Team tab; demand on the Demand page.
 */
export const OfferingTeamStepsRow: FC<{
  row: ProviderRequestedOffering;
  providerUuid: string;
  fetch?: () => void;
}> = ({ row, providerUuid, fetch }) => {
  const stepsQuery = useQuery({
    queryKey: ['offering-team-steps', row.uuid],
    queryFn: async () =>
      (
        await proposalRequestedOfferingsTeamStepsList({
          path: { uuid: row.uuid },
        })
      ).data,
  });
  const accepted = row.state === 'accepted';
  const teamQuery = useQuery({
    queryKey: ['offering-team', row.uuid],
    queryFn: async () =>
      (
        await proposalRequestedOfferingsTeamRetrieve({
          path: { uuid: row.uuid },
        })
      ).data,
    enabled: accepted,
  });
  const slotsQuery = useQuery({
    queryKey: ['team-slots', 'step-slots', row.uuid],
    queryFn: async () =>
      (
        await proposalRequestedOfferingsTeamStepSlotsList({
          path: { uuid: row.uuid },
        })
      ).data,
    // Only an accepted request has proposals whose steps reach the team.
    enabled: accepted,
  });
  const steps = stepsQuery.data ?? [];
  const slots = slotsQuery.data ?? [];
  const user = useUser();
  const { refetch: refetchSlots } = slotsQuery;
  const handOn = useMemo(() => {
    const stepKeys = steps
      .filter((step) => step.delegable_within_team)
      .map((step) => step.key);
    if (!stepKeys.length) return undefined;
    return {
      requestedOfferingUuid: row.uuid,
      // Not the viewer: the person a slot is handed to may not hand it on.
      people: getTeamPeople(teamQuery.data).filter(
        (person) => person.uuid !== user?.uuid,
      ),
      stepKeys,
    };
  }, [steps, row.uuid, teamQuery.data, user?.uuid]);
  const refetchAll = useMemo(
    () => () => {
      refetchSlots();
      fetch?.();
    },
    [refetchSlots, fetch],
  );
  return (
    <ExpandableContainer>
      <div className={ROW_SECTIONS_CLASS}>
        <OfferingManagersNeeded row={row} providerUuid={providerUuid} />
        <TeamStepsSummary steps={steps} offeringName={row.offering_name} />
        <RowSection title={translate('Open now')}>
          {accepted && handOn ? (
            <p className="text-tertiary mb-1.5" data-testid="default-hand-on">
              {row.default_delegate_name
                ? translate('New slots go to {name}.', {
                    name: row.default_delegate_name,
                  })
                : translate('New slots stay with the offering’s managers.')}
            </p>
          ) : null}
          {!accepted ? (
            <p className="text-tertiary mb-0">
              {translate(
                'Accept the request to receive work on the call’s proposals.',
              )}
            </p>
          ) : slotsQuery.isLoading ? (
            <LoadingSpinner />
          ) : slots.length ? (
            <TeamSlotsTable
              tableId={`offering-team-slots-${row.uuid}`}
              slots={slots}
              version={slotsQuery.dataUpdatedAt}
              providerUuid={providerUuid}
              showStep={steps.length > 1}
              handOn={handOn}
              refetch={refetchAll}
            />
          ) : (
            <p className="text-tertiary mb-0">
              {translate('Nothing is waiting on your team in this call.')}
            </p>
          )}
        </RowSection>
        <div>
          <Link
            state="marketplace-provider-call-demand"
            params={{
              uuid: providerUuid,
              call: callFilterParam(row.call_uuid, row.call_name),
            }}
            label={translate('Demand for this call')}
            buttonVariant="tertiary"
          />
        </div>
      </div>
    </ExpandableContainer>
  );
};
