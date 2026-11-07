import {
  OfferingTeam,
  OfferingTeamPerson,
  OfferingTeamSlot,
  OfferingTeamStep,
  ProviderRequestedOffering,
} from 'waldur-js-client';

import { translate } from '@/i18n';

type TeamCounts = Pick<
  ProviderRequestedOffering,
  'offering_managers_count' | 'team_steps_count' | 'state'
>;

/**
 * Whether the call hands work to the offering's team and nobody is on it.
 * Only offering managers count: the provider organisation's owners answer
 * requests but do not assess.
 */
export const needsOfferingManagers = (row: TeamCounts): boolean =>
  row.state !== 'canceled' &&
  row.team_steps_count > 0 &&
  row.offering_managers_count === 0;

/** The offering's Team tab, where its provider adds offering managers. */
export const offeringTeamLink = (
  providerUuid: string,
  offeringUuid: string,
) => ({
  state: 'marketplace-offering-details',
  params: {
    uuid: providerUuid,
    offering_uuid: offeringUuid,
    tab: 'permissions',
  },
});

export const phaseLabel = (phase: string): string =>
  ({
    evaluation: translate('Evaluation'),
    extension: translate('Extension request'),
    closing: translate('Final report'),
  })[phase] ?? phase;

/** Who does a step of the call for the offering, in a few words. */
export const stepDoerText = (
  step: Pick<OfferingTeamStep, 'team_part' | 'delegable_within_team'>,
  offeringName: string,
): string => {
  if (step.team_part !== 'completes') {
    return translate('{offering}’s team contributes', {
      offering: offeringName,
    });
  }
  return step.delegable_within_team
    ? translate('Done by {offering}’s managers, or someone they hand it to', {
        offering: offeringName,
      })
    : translate('Done by {offering}’s managers', { offering: offeringName });
};

type SlotHolderKind = 'delegate' | 'managers' | 'stand-in';

export interface SlotHolder {
  kind: SlotHolderKind;
  label: string;
  /** For a hand-on: whether the person took it over yet. */
  accepted?: boolean;
}

/**
 * Who holds an open slot: the person it was handed to, else the offering's
 * managers, else -- with nobody on the team -- the call's managers.
 */
export const getSlotHolder = (
  slot: Pick<
    OfferingTeamSlot,
    'delegate_uuid' | 'delegate_name' | 'delegate_accepted' | 'stand_in'
  >,
): SlotHolder => {
  if (slot.delegate_uuid) {
    return {
      kind: 'delegate',
      label: slot.delegate_name || translate('Someone on the team'),
      accepted: slot.delegate_accepted,
    };
  }
  if (slot.stand_in) {
    return { kind: 'stand-in', label: translate('Call managers stand in') };
  }
  return { kind: 'managers', label: translate('Offering managers') };
};

/**
 * Everyone on the offering's team a slot can be handed to: its other people
 * first, then its managers, each once.
 */
export const getTeamPeople = (
  team: OfferingTeam | undefined,
): OfferingTeamPerson[] => {
  const people = new Map<string, OfferingTeamPerson>();
  for (const person of [
    ...(team?.delegates ?? []),
    ...(team?.managers ?? []),
  ]) {
    if (!people.has(person.uuid)) {
      people.set(person.uuid, person);
    }
  }
  return [...people.values()];
};
