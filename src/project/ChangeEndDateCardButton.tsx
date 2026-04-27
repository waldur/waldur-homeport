import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Project } from 'waldur-js-client';

import { translate } from '@/i18n';
import { CompactActionButton } from '@/table/CompactActionButton';

import { useChangeEndDateRequest } from './useChangeEndDateRequest';

interface ChangeEndDateCardButtonProps {
  project: Project;
  refetch: () => void;
}

/**
 * Inline “request end date change” control for project cards (grid view).
 * Same rules as {@link ChangeEndDateAction} in the projects table.
 */
export const ChangeEndDateCardButton: FC<ChangeEndDateCardButtonProps> = ({
  project,
  refetch,
}) => {
  const { showRequest, open } = useChangeEndDateRequest(project, refetch);

  if (!showRequest) {
    return null;
  }

  const label = translate('Change end date');

  return (
    <CompactActionButton
      className="ms-1"
      action={(e) => {
        e?.stopPropagation?.();
        e?.preventDefault?.();
        open();
      }}
      iconNode={<PencilSimpleIcon weight="bold" />}
      tooltip={label}
    />
  );
};
