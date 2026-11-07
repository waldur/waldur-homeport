import { FC } from 'react';
import { OrderAward } from 'waldur-js-client';

import { formatUsageValue } from '@/core/formatNumber';
import { Link } from '@/core/Link';
import { formatJsxTemplate, translate } from '@/i18n';
import { OFFERING_TEAM_PROPOSAL_STATE } from '@/proposals/proposal/proposalView';
import {
  componentLabel,
  componentUnit,
} from '@/proposals/provider-calls/offeringDemand';
import { DASH_ESCAPE_CODE } from '@/table/constants';

interface AwardComponent {
  type: string;
  name?: string;
  measured_unit?: string | null;
  limit_period?: string | null;
}

export interface AwardLimitLine {
  key: string;
  label: string;
  unit: string;
  awarded: number | null;
  requested: number | null;
}

const asNumber = (value: unknown): number | null =>
  typeof value === 'number' ? value : null;

/**
 * What the award grants beside what the applicant asked for, one line per
 * component: named and in the offering's order where its components are
 * known, by type otherwise.
 */
export const getAwardLimitLines = (
  award: Pick<OrderAward, 'awarded_limits' | 'requested_limits'>,
  components?: AwardComponent[] | null,
): AwardLimitLine[] => {
  const awarded = award.awarded_limits ?? {};
  const requested = award.requested_limits ?? {};
  const types = [
    ...new Set([...Object.keys(awarded), ...Object.keys(requested)]),
  ];
  const known = (components ?? []).filter((c) => types.includes(c.type));
  const ordered = [
    ...known.map((c) => c.type),
    ...types.filter((type) => !known.some((c) => c.type === type)),
  ];
  return ordered.map((type) => {
    const component = known.find((c) => c.type === type);
    return {
      key: type,
      label: component
        ? componentLabel({ name: component.name ?? '', type })
        : type,
      unit: component ? componentUnit(component) : '',
      awarded: asNumber(awarded[type]),
      requested: award.requested_limits ? asNumber(requested[type]) : null,
    };
  });
};

const amount = (value: number | null, unit: string) =>
  value === null
    ? DASH_ESCAPE_CODE
    : [formatUsageValue(value), unit].filter(Boolean).join(' ');

/** "From call X, proposal Y", the proposal linked where the viewer may open it. */
export const OrderAwardSource: FC<{
  award: OrderAward;
  /** Opened from a provider's pages: the proposal keeps that provider's view. */
  providerUuid?: string;
}> = ({ award, providerUuid }) => (
  <>
    {translate(
      'From call {call}, proposal {proposal}',
      {
        call: (
          <Link
            state="public-call.details"
            params={{ call_uuid: award.call_uuid }}
            label={award.call_name}
          />
        ),
        proposal: award.can_read ? (
          <Link
            {...(providerUuid
              ? {
                  state: OFFERING_TEAM_PROPOSAL_STATE,
                  params: {
                    uuid: providerUuid,
                    proposal_uuid: award.proposal_uuid,
                  },
                }
              : {
                  state: 'proposals.manage-proposal',
                  params: { proposal_uuid: award.proposal_uuid },
                })}
            label={award.proposal_name}
          />
        ) : (
          <b>{award.proposal_name}</b>
        ),
      },
      formatJsxTemplate,
    )}
    {award.round_name ? (
      <span className="text-quaternary"> ({award.round_name})</span>
    ) : null}
  </>
);

/**
 * The award's amounts: what is granted and, for an item the applicant asked
 * for, what they asked. An item the call manager added has no request.
 */
export const OrderAwardLimits: FC<{
  award: OrderAward;
  components?: AwardComponent[] | null;
}> = ({ award, components }) => {
  const lines = getAwardLimitLines(award, components);
  if (!lines.length) {
    return <>{DASH_ESCAPE_CODE}</>;
  }
  return (
    <div className="flex flex-col">
      {lines.map((line) => (
        <span key={line.key}>
          <span className="text-quaternary">{line.label}: </span>
          {award.requested_limits
            ? translate('{awarded} awarded of {requested} requested', {
                awarded: amount(line.awarded, line.unit),
                requested: amount(line.requested, line.unit),
              })
            : translate('{awarded} awarded', {
                awarded: amount(line.awarded, line.unit),
              })}
        </span>
      ))}
    </div>
  );
};
