import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { ProposalCall } from '../types';

const CallRoundsDialog = lazyComponent(
  () => import('./CallRoundsDialog'),
  'CallRoundsDialog',
);

const showAllRoundsDialog = (call) =>
  openModalDialog(CallRoundsDialog, {
    resolve: { call },
    size: 'lg',
  });

export const CallShowAllRounds = ({ call }: { call: ProposalCall }) => {
  const dispatch = useDispatch();

  if (call?.rounds?.length < 4) {
    return null;
  }
  return (
    <button
      className="text-link"
      type="button"
      onClick={() => dispatch(showAllRoundsDialog(call))}
    >
      {translate('See all rounds')}
    </button>
  );
};
