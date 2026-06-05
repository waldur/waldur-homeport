import { FC, useState } from 'react';
import { MatrixRoom, matrixRoomsDisable } from 'waldur-js-client';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface DisableChatRoomDialogProps {
  resolve: {
    room: MatrixRoom;
    refetch?(): void;
  };
}

export const DisableChatRoomDialog: FC<DisableChatRoomDialogProps> = ({
  resolve,
}) => {
  const [deleteHistory, setDeleteHistory] = useState(false);

  const { mutate: disableRoom, isPending } = useManagedMutation<
    unknown,
    unknown,
    boolean
  >({
    mutationFn: (purgeHistory) =>
      matrixRoomsDisable({
        path: { uuid: resolve.room.uuid },
        body: { delete_history: purgeHistory },
      }),
    successMessage: translate('Chat room is being disabled.'),
    errorMessage: translate('Unable to disable chat room.'),
    refetch: resolve.refetch,
  });

  return (
    <ModalDialog
      title={translate('Disable chat room')}
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            submitting={isPending}
            label={translate('Disable')}
            className="btn btn-danger"
            onClick={() => disableRoom(deleteHistory)}
          />
        </>
      }
    >
      <p>
        {translate(
          'Are you sure you want to disable the chat room "{name}"? All members will be kicked from the room.',
          { name: resolve.room.room_name },
        )}
      </p>
      <AwesomeCheckbox
        label={translate('Also delete chat history exports')}
        value={deleteHistory}
        onChange={setDeleteHistory}
      />
    </ModalDialog>
  );
};
