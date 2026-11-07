import { formatDate, formatDateTime } from '@/core/dateUtils';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { formatRoundCutoff } from '@/proposals/roundCutoff';

import { CallDurationPolicy } from '../CallDurationPolicy';
import { Call } from '../types';
import { getRoundsWithStatus } from '../utils';

interface CallDetailsHeaderBodyProps {
  call: Call;
}

type RoundWithStatus = ReturnType<typeof getRoundsWithStatus>[number];

const byStart = (a: RoundWithStatus, b: RoundWithStatus) =>
  new Date(a.start_time).getTime() - new Date(b.start_time).getTime();

/**
 * The round the call's header is about: the one open for submissions, else
 * the next one scheduled, else the last one that ended -- whatever order
 * the rounds come in.
 */
export const pickHeaderRound = (rounds: Call['rounds']) => {
  const withStatus = getRoundsWithStatus(rounds ?? []).sort(byStart);
  return (
    withStatus.find((round) => round.status?.value === 'open') ??
    withStatus.find((round) => round.status?.value === 'scheduled') ??
    withStatus.filter((round) => round.status?.value === 'ended').pop()
  );
};

/** Where an ended round's proposals stand: submissions are over, the call
 * may well still be running them. */
const endedRoundStage = (round: RoundWithStatus) =>
  ({
    evaluating: translate('Its proposals are being evaluated.'),
    deciding: translate('Its proposals are being decided.'),
    results_published: translate('Its results are published.'),
    closed: translate('The round is closed.'),
  })[(round as any).lifecycle_state as string] ?? null;

export const CallDetailsHeaderBody = (props: CallDetailsHeaderBodyProps) => {
  if (isFeatureVisible(MarketplaceFeatures.call_only)) {
    return null;
  }
  const nextRound = pickHeaderRound(props.call.rounds);
  if (!nextRound) {
    return (
      <p className="text-tertiary mb-0">
        {translate('The call has no rounds yet.')}
      </p>
    );
  }
  return (
    <>
      {nextRound.status?.value === 'open' && (
        <table className="table mb-0 px-0 h-auto w-auto">
          <tbody>
            <tr>
              <th className="font-medium w-[125px] p-0 pe-2.5 pb-1 whitespace-nowrap">
                {translate('Open round started')}:
              </th>
              <td className="text-quaternary p-0 pb-1">
                {formatDateTime(nextRound.start_time)}
              </td>
            </tr>
            <tr>
              <th className="font-medium w-[125px] p-0 pe-2.5 whitespace-nowrap">
                {translate('Open round ends')}:
              </th>
              <td className="text-quaternary p-0">
                {formatRoundCutoff(nextRound)}
              </td>
            </tr>
            <tr>
              <th className="font-medium w-[125px] p-0 pe-2.5 pt-1 whitespace-nowrap">
                {translate('Project duration')}:
              </th>
              <td className="text-quaternary p-0 pt-1">
                <CallDurationPolicy call={props.call} />
              </td>
            </tr>
          </tbody>
        </table>
      )}
      {/* The call itself may well be active: only its submissions are
          over, until another round is scheduled. */}
      {nextRound.status?.value === 'ended' && (
        <p className="text-secondary mb-0" data-testid="no-open-round">
          {translate(
            'No round is open for submissions: the last one closed on {date}.',
            { date: formatDate(nextRound.cutoff_time) },
          )}{' '}
          {endedRoundStage(nextRound)}
        </p>
      )}
      {nextRound.status?.value === 'scheduled' && (
        <table className="table mb-0 px-0 h-auto w-auto">
          <tbody>
            <tr>
              <th className="font-medium w-[125px] p-0 pe-2.5 pb-1 whitespace-nowrap">
                {translate('Next round starts')}:
              </th>
              <td className="text-quaternary p-0 pb-1">
                {formatDateTime(nextRound.start_time)}
              </td>
            </tr>
            <tr>
              <th className="font-medium w-[125px] p-0 pe-2.5 whitespace-nowrap">
                {translate('Next round ends')}:
              </th>
              <td className="text-quaternary p-0">
                {formatRoundCutoff(nextRound)}
              </td>
            </tr>
            <tr>
              <th className="font-medium w-[125px] p-0 pe-2.5 pt-1 whitespace-nowrap">
                {translate('Project duration')}:
              </th>
              <td className="text-quaternary p-0 pt-1">
                <CallDurationPolicy call={props.call} />
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </>
  );
};
