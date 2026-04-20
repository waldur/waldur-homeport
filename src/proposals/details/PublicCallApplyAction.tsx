import { PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { Call } from '../types';

import { usePublicCallApply } from './usePublicCallApply';

export const PublicCallApplyAction: FC<{ call: Call }> = ({ call }) => {
  const { activeRound, hidden, handleApply } = usePublicCallApply(call);

  if (hidden) return null;

  return (
    <ActionItem
      title={translate('Apply')}
      action={handleApply}
      iconNode={<PaperPlaneTiltIcon weight="bold" />}
      disabled={!activeRound}
      tooltip={
        !activeRound
          ? translate('No open or scheduled round available.')
          : undefined
      }
    />
  );
};
