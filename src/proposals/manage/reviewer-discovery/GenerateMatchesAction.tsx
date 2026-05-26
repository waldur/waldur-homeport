import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';

const GenerateMatchesDialog = lazyComponent(() =>
  import('./GenerateMatchesDialog').then((m) => ({
    default: m.GenerateMatchesDialog,
  })),
);

interface GenerateMatchesActionProps {
  call: Call;
  refetch: () => void;
}

export const GenerateMatchesAction: FC<GenerateMatchesActionProps> = ({
  call,
  refetch,
}) => {
  const { openDialog } = useModal();

  const handleGenerate = useCallback(() => {
    openDialog(GenerateMatchesDialog, {
      resolve: { call, refetch },
      size: 'lg',
    });
  }, [call, refetch, openDialog]);

  return (
    <ActionItem
      title={translate('Generate matches')}
      action={handleGenerate}
      iconNode={<MagnifyingGlassIcon weight="bold" />}
    />
  );
};
