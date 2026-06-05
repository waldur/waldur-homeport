import { FC } from 'react';
import { matrixRoomsCreate } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface CreateMatrixRoomDialogProps {
  resolve: {
    projectUuid: string;
    projectName: string;
    refetch?(): void;
  };
}

export const CreateMatrixRoomDialog: FC<CreateMatrixRoomDialogProps> = ({
  resolve,
}) => {
  const { mutate: createRoom, isPending } = useManagedMutation<
    unknown,
    unknown,
    void
  >({
    mutationFn: () =>
      matrixRoomsCreate({ body: { project: resolve.projectUuid } }),
    successMessage: translate('Chat room creation has been initiated.'),
    errorMessage: translate('Unable to create chat room.'),
    refetch: resolve.refetch,
  });

  return (
    <ModalDialog
      title={translate('Create chat room')}
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            submitting={isPending}
            label={translate('Create')}
            onClick={() => createRoom()}
          />
        </>
      }
    >
      <p>
        {translate(
          'Create a Matrix chat room for project "{name}"? All project members will be invited automatically.',
          { name: resolve.projectName },
        )}
      </p>
    </ModalDialog>
  );
};
