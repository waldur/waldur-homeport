import { CheckIcon } from '@phosphor-icons/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceUserOfferingConsentsCreate } from 'waldur-js-client';

import { SafeMarkdown } from '@/core/SafeMarkdown';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useModal } from '@/modal/hooks';
import { ModalDialog } from '@/modal/ModalDialog';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const TosViewDialog = ({
  resolve: { tos, offering = undefined, refetch = undefined },
}) => {
  const dispatch = useDispatch();
  const { closeDialog } = useModal();
  const [accepting, setAccepting] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const tosContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tosContentRef.current;
    // No scroll container (no markdown content) or content fits without scroll
    if (!el || el.scrollHeight <= el.clientHeight) {
      setScrolledToBottom(true);
    }
  }, []);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (scrolledToBottom) return;
      const el = e.currentTarget;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 2) {
        setScrolledToBottom(true);
      }
    },
    [scrolledToBottom],
  );

  const handleAccept = useCallback(async () => {
    setAccepting(true);
    try {
      await marketplaceUserOfferingConsentsCreate({
        body: { offering: offering.uuid },
      });
      await refetch();
      dispatch(
        showSuccess(
          translate('Terms of Service has been accepted successfully.'),
        ),
      );
      closeDialog();
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to accept Terms of Service.'),
        ),
      );
    } finally {
      setAccepting(false);
    }
  }, [dispatch, offering, refetch, closeDialog]);

  return (
    <ModalDialog
      title={translate('View ToS {version}', { version: tos.version })}
      footer={
        <>
          <CloseDialogButton label={translate('Close')} />
          {offering && refetch && !tos.has_user_consent && (
            <SubmitButton
              submitting={accepting}
              disabled={!scrolledToBottom}
              disabledReason={
                !scrolledToBottom
                  ? translate(
                      'Please read the Terms of Service before accepting.',
                    )
                  : undefined
              }
              label={translate('Accept')}
              iconNode={<CheckIcon weight="bold" />}
              iconOnLeft
              type="button"
              onClick={handleAccept}
            />
          )}
        </>
      }
    >
      {tos.terms_of_service && (
        <div className="mb-4">
          <h5 className="mb-3">{translate('Terms of service content')}</h5>
          <div
            ref={tosContentRef}
            className="border rounded tos-content-preview"
            onScroll={handleScroll}
          >
            <SafeMarkdown text={tos.terms_of_service} />
          </div>
        </div>
      )}

      {tos.terms_of_service_link && (
        <div className="mb-3">
          <strong>{translate('External link:')}</strong>
          <div className="mt-2">
            <a
              href={tos.terms_of_service_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              {tos.terms_of_service_link}
            </a>
          </div>
        </div>
      )}
    </ModalDialog>
  );
};
