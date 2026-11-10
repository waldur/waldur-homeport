import { FC } from 'react';
import { AwardedResource, ProposalRun } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { formatUsageValue } from '@/core/formatNumber';
import { translate } from '@/i18n';
import { getRequestedLines } from '@/proposals/provider-calls/requestedLines';

const amountWithUnit = (amount: number, unit: string) =>
  [formatUsageValue(amount), unit].filter(Boolean).join(' ');

/** One component of a resource: what the award gave it, and what the run asks. */
interface RunAskLine {
  key: string;
  label: string;
  unit: string;
  awarded?: number;
  asked?: number;
}

/**
 * What the run asks of one awarded resource, component by component: the
 * award next to the extension's ask, for the components either names. An
 * empty list when the run asks nothing more of it.
 */
const getRunAskLines = (
  item: Pick<AwardedResource, 'resource' | 'limits' | 'requested_offering'>,
  requestedLimits: ProposalRun['requested_limits'] | undefined,
): RunAskLine[] => {
  const asked = (
    item.resource ? (requestedLimits ?? {})[item.resource] : undefined
  ) as Record<string, number> | undefined;
  if (!asked || !Object.keys(asked).length) return [];
  const awarded = (item.limits ?? {}) as Record<string, number>;
  const components = item.requested_offering?.components;
  const askedLines = getRequestedLines(asked, components);
  return askedLines.map((line) => ({
    key: line.key,
    label: line.label,
    unit: line.unit,
    awarded: awarded[line.key],
    asked: line.amount,
  }));
};

/**
 * What an extension or final report puts to an offering's team: an
 * extension's new end date and, per resource of the offering, the limits it
 * asks for next to those awarded; a final report's award. Not the proposal's
 * original request, which the award and any earlier extension have replaced.
 */
export const RunAskedOfOffering: FC<{
  offeringName: string;
  run: Pick<ProposalRun, 'phase' | 'requested_end_date' | 'requested_limits'>;
  awarded: AwardedResource[];
}> = ({ offeringName, run, awarded }) => {
  const provisioned = awarded.filter((item) => item.resource);
  if (run.phase === 'closing') {
    const lines = provisioned.flatMap((item) =>
      getRequestedLines(
        item.limits as Record<string, number>,
        item.requested_offering?.components,
      ),
    );
    if (!lines.length) return null;
    return (
      <div data-testid="contribution-requested">
        <div className="font-semibold">
          {translate('Awarded from {offering}', { offering: offeringName })}
        </div>
        <ul className="list-unstyled mb-0">
          {lines.map((line, i) => (
            <li key={`${line.key}-${i}`}>
              <span className="text-quaternary">{line.label}: </span>
              {amountWithUnit(line.amount, line.unit)}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  const resources = provisioned
    .map((item) => ({
      item,
      lines: getRunAskLines(item, run.requested_limits),
    }))
    .filter(({ lines }) => lines.length);
  return (
    <div data-testid="contribution-requested">
      <div className="font-semibold">
        {translate('Asked of {offering} by the extension', {
          offering: offeringName,
        })}
      </div>
      <ul className="list-unstyled mb-0">
        {run.requested_end_date && (
          <li>
            <span className="text-quaternary">
              {translate('New end date')}:{' '}
            </span>
            {formatDate(run.requested_end_date)}
          </li>
        )}
        {resources.flatMap(({ item, lines }) =>
          lines.map((line) => (
            <li key={`${item.resource}-${line.key}`}>
              <span className="text-quaternary">
                {resources.length > 1 && item.resource_name
                  ? `${item.resource_name}, ${line.label}: `
                  : `${line.label}: `}
              </span>
              {line.asked !== undefined
                ? amountWithUnit(line.asked, line.unit)
                : null}
              {line.awarded !== undefined && (
                <span className="text-quaternary">
                  {' '}
                  {translate('(awarded: {amount})', {
                    amount: amountWithUnit(line.awarded, line.unit),
                  })}
                </span>
              )}
            </li>
          )),
        )}
        {!resources.length && (
          <li className="text-quaternary">
            {translate('No more resources are asked of this offering.')}
          </li>
        )}
      </ul>
    </div>
  );
};
