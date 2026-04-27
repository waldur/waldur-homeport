import { CalendarXIcon } from '@phosphor-icons/react';
import { Project } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';

import { useChangeEndDateRequest } from './useChangeEndDateRequest';

export const ChangeEndDateAction = ({
  project,
  refetch,
}: {
  project: Project;
  refetch: () => void;
}) => {
  const { showRequest, open } = useChangeEndDateRequest(project, refetch);

  if (!showRequest) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Change end date')}
      action={open}
      iconNode={<CalendarXIcon weight="bold" />}
    />
  );
};
