import { FC, useCallback, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/types';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { Call } from '../types';
import { getRoundsWithStatus } from '../utils';

interface PublicCallApplyButtonProps {
  call: Call;
  title?: string;
  variant?: Variant;
  className?: string;
}

const ProposalCreateDialog = lazyComponent(
  () => import('@waldur/proposals/proposal/create/AddProposalDialog'),
  'AddProposalDialog',
);

export const PublicCallApplyButton: FC<PublicCallApplyButtonProps> = ({
  call,
  title = translate('Apply to round'),
  variant = 'primary',
  className,
}) => {
  const activeRound =
    call.state == 'active' &&
    useMemo(() => {
      const items = getRoundsWithStatus(call.rounds);
      const first = items[0];
      if (
        first &&
        (first.status.value === 'open' || first.status.value === 'scheduled')
      ) {
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

  return activeRound ? (
    <Button
      variant={variant}
      className={className}
      onClick={openAddProposalDialog}
    >
      {title}
    </Button>
  ) : (
    <Button variant={variant} className={className} disabled>
      {title}
    </Button>
  );
};
