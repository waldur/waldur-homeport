import { useRouter } from '@uirouter/react';
import { FC } from 'react';

import { AlertItem, BaseButton } from 'waldur-ui';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { canUpdateCall } from '@/proposals/utils';
import { useUser } from '@/workspace/hooks';

import { CALL_MAIL_STATE, mailPageParams, mailTitle } from './mailPage';
import { MailView } from './MailView';
import { MailTarget, useCallForMail, useMailPreview } from './queries';

export const previewErrorText = (error: unknown): string => {
  const body = getErrorBody(error);
  const messages = body
    ? Object.values(body)
        .flat()
        .map((value) => String(value))
    : [];
  return messages.length
    ? messages.join(' ')
    : translate('The mail cannot be previewed.');
};

/** Whether the user may change a call's mails: its rules and wording. */
export const canEditMailOf = (user, call): boolean =>
  Boolean(call && call.state !== 'archived' && canUpdateCall(user, call));

const useCanEditMail = (callUuid: string) => {
  const user = useUser();
  const { data: call } = useCallForMail(callUuid);
  return canEditMailOf(user, call);
};

interface Props {
  resolve: {
    callUuid: string;
    target: MailTarget;
  };
}

/**
 * One mail of the call, as it would be sent on a synthetic proposal of the
 * call (nothing is sent). Its rules and wording are changed on its page.
 */
export const MailDialog: FC<Props> = ({ resolve }) => {
  const { callUuid, target } = resolve;
  const router = useRouter();
  const canEdit = useCanEditMail(callUuid);
  const preview = useMailPreview(callUuid, target);

  return (
    <ModalDialog
      title={mailTitle(target, preview.data?.label)}
      subtitle={translate(
        'As it would be sent on an example proposal of this call. Nothing is sent, and no real person is named.',
      )}
      footer={
        <>
          <CloseDialogButton label={translate('Close')} />
          {canEdit && (
            <BaseButton
              variant="primary"
              size="lg"
              className="min-w-[var(--dialog-action-min-w)]"
              label={translate('Edit')}
              onClick={() =>
                router.stateService.go(CALL_MAIL_STATE, {
                  call_uuid: callUuid,
                  ...mailPageParams(target),
                })
              }
            />
          )}
        </>
      }
    >
      {preview.isLoading ? (
        <LoadingSpinner />
      ) : preview.error ? (
        <AlertItem
          variant="warning"
          role="alert"
          title={previewErrorText(preview.error)}
        />
      ) : preview.data ? (
        <MailView mail={preview.data} htmlOnly />
      ) : null}
    </ModalDialog>
  );
};
