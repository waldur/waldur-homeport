import {
  ArrowBendUpLeftIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { ComponentPropsWithoutRef, FC, forwardRef } from 'react';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsMenu } from '@/table/ActionsDropdown';

import {
  isPendingMessage,
  useMatrixMessageActions,
} from './MatrixMessageActionsContext';
import { MatrixChatMessage } from './types';

const MoreActionsToggle = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<'button'>
>((props, ref) => (
  <button
    ref={ref}
    type="button"
    className="tc-msg-reactions-toolbar__btn tc-msg-reactions-toolbar__more"
    aria-label={translate('More message actions')}
    {...props}
  >
    <DotsThreeIcon weight="bold" />
  </button>
));
MoreActionsToggle.displayName = 'MoreActionsToggle';

/**
 * Reply, edit and delete, in the message's hover toolbar. A message still
 * being sent gets none: until the homeserver accepts it there is no event id
 * to relate to.
 */
export const MatrixMessageActions: FC<{ message: MatrixChatMessage }> = ({
  message,
}) => {
  const { startReply, startEdit, deleteMessage, canEdit, canDelete } =
    useMatrixMessageActions();
  if (message.redacted || isPendingMessage(message)) return null;
  const editable = canEdit(message);
  const deletable = canDelete(message);

  return (
    <>
      <span className="tc-msg-reactions-toolbar__divider" aria-hidden />
      <button
        type="button"
        className="tc-msg-reactions-toolbar__btn tc-msg-reactions-toolbar__more"
        aria-label={translate('Reply')}
        title={translate('Reply')}
        onClick={() => startReply(message)}
      >
        <ArrowBendUpLeftIcon weight="bold" />
      </button>
      {(editable || deletable) && (
        <ActionsMenu toggle={<MoreActionsToggle />} side="bottom" align="end">
          {editable && (
            <ActionItem
              title={translate('Edit')}
              action={() => startEdit(message)}
              iconNode={<PencilSimpleIcon weight="bold" />}
            />
          )}
          {deletable && (
            <ActionItem
              title={translate('Delete')}
              action={() => deleteMessage(message)}
              iconNode={<TrashIcon weight="bold" />}
              iconColor="danger"
              className="text-danger"
            />
          )}
        </ActionsMenu>
      )}
    </>
  );
};
