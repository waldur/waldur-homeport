import { FC, useCallback, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { Link } from '@waldur/core/Link';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import {
  getCallStatus,
  getSortedRoundsWithStatus,
} from '@waldur/proposals/utils';

import { Call } from '../types';

import { CallDetailsHeaderBody } from './CallDetailsHeaderBody';
import { CallRoundsList } from './CallRoundsList';
import { CallShowAllRounds } from './CallShowAllRounds';

const heroBg = require('@waldur/proposals/proposal-calls.png');

interface PublicCallDetailsHeroProps {
  call: Call;
}

const ProposalCreateDialog = lazyComponent(
  () => import('@waldur/proposals/proposal/create/AddProposalDialog'),
  'AddProposalDialog',
);

export const PublicCallDetailsHero: FC<PublicCallDetailsHeroProps> = ({
  call,
}) => {
  const activeRound =
    call.state == 'active' &&
    useMemo(() => {
      const items = getSortedRoundsWithStatus(call.rounds);
      const first = items[0];
      if (first && [0, 1].includes(first.state.code)) {
        return first;
      }
      return null;
    }, [call]);

  const dispatch = useDispatch();
  const openAddProposalDialog = useCallback(
    () =>
      activeRound &&
      dispatch(
        openModalDialog(ProposalCreateDialog, {
          resolve: { call, round: activeRound },
          size: 'md',
        }),
      ),
    [dispatch, activeRound],
  );

  const status = useMemo(() => getCallStatus(call), [call]);

  return (
    <PublicDashboardHero
      logo={undefined}
      logoAlt={call.name}
      logoBottomLabel={translate('Call')}
      logoBottomClass="bg-secondary"
      logoTopLabel={call.state}
      logoTopClass={'bg-' + status.color}
      backgroundImage={heroBg}
      asHero
      title={
        <>
          <h3>{call.name}</h3>
          <Link state="#" className="text-gray-600 text-link">
            {call.customer_name}
          </Link>
        </>
      }
      quickActions={
        <div className="d-flex gap-5 justify-content-between">
          {activeRound ? (
            <Button variant="primary" onClick={openAddProposalDialog}>
              {translate('Apply to round')}
            </Button>
          ) : (
            <Button variant="primary" disabled>
              {translate('Apply to round')}
            </Button>
          )}
        </div>
      }
      quickBody={<CallRoundsList call={call} max={3} filterCode={-1} />}
      quickFooter={<CallShowAllRounds call={call} />}
      quickFooterClassName="justify-content-center"
    >
      {call.rounds.length > 0 && <CallDetailsHeaderBody call={call} />}
    </PublicDashboardHero>
  );
};
