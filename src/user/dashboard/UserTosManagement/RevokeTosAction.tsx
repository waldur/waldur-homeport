import { XIcon } from '@phosphor-icons/react';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

import { RevokeTosDialog } from './RevokeTosDialog';

export const RevokeTosAction = ({ tos, offering, refetch, offeringUuid }) => {
  const { openDialog } = useModal();

  const handleClick = () => {
    openDialog(RevokeTosDialog, {
      resolve: { tos, offering, refetch, offeringUuid },
      size: 'lg',
    });
  };

  return (
    <ActionItem
      title={translate('Revoke')}
      action={handleClick}
      iconNode={<XIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};
