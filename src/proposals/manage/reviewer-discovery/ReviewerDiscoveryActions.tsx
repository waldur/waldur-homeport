import {
  CaretDownIcon,
  EnvelopeSimpleIcon,
  MagnifyingGlassIcon,
  PaperPlaneTiltIcon,
} from '@phosphor-icons/react';
import { FC, useCallback, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { proposalProtectedCallsSendInvitations } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { useNotify } from '@/store/hooks';

const DirectEmailInviteDialog = lazyComponent(() =>
  import('./DirectEmailInviteDialog').then((m) => ({
    default: m.DirectEmailInviteDialog,
  })),
);

const GenerateMatchesDialog = lazyComponent(() =>
  import('./GenerateMatchesDialog').then((m) => ({
    default: m.GenerateMatchesDialog,
  })),
);

interface ReviewerDiscoveryActionsProps {
  call: Call;
  refetch: () => void;
}

export const ReviewerDiscoveryActions: FC<ReviewerDiscoveryActionsProps> = ({
  call,
  refetch,
}) => {
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse, showError } = useNotify();
  const [isSending, setIsSending] = useState(false);

  const handleGenerate = useCallback(() => {
    dispatch(
      openModalDialog(GenerateMatchesDialog, {
        resolve: { call, refetch },
        size: 'lg',
      }),
    );
  }, [call, refetch, dispatch]);

  const handleSendInvitations = useCallback(async () => {
    setIsSending(true);
    try {
      const response = await proposalProtectedCallsSendInvitations({
        path: { uuid: call.uuid },
      });
      const data = response.data as { invitations_sent: number };
      if (data.invitations_sent > 0) {
        showSuccess(
          translate('Sent {count} invitations.', {
            count: data.invitations_sent,
          }),
        );
      } else {
        showError(
          translate(
            'No invitations sent. Please confirm some suggestions first.',
          ),
        );
      }
      refetch();
    } catch (error) {
      showErrorResponse(error, translate('Unable to send invitations.'));
    } finally {
      setIsSending(false);
    }
  }, [call.uuid, showSuccess, showError, showErrorResponse, refetch]);

  const handleDirectInvite = useCallback(() => {
    dispatch(
      openModalDialog(DirectEmailInviteDialog, {
        resolve: { call, refetch },
        size: 'lg',
      }),
    );
  }, [call, refetch, dispatch]);

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="light-primary"
        className="no-arrow btn-icon-right"
      >
        {translate('Actions')}
        <span className="svg-icon svg-icon-2 rotate-180">
          <CaretDownIcon weight="bold" />
        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={handleGenerate}>
          <span className="svg-icon svg-icon-2 me-2">
            <MagnifyingGlassIcon weight="bold" />
          </span>
          {translate('Generate matches')}
        </Dropdown.Item>
        <Dropdown.Item onClick={handleSendInvitations} disabled={isSending}>
          <span className="svg-icon svg-icon-2 me-2">
            <PaperPlaneTiltIcon weight="bold" />
          </span>
          {isSending
            ? translate('Sending...')
            : translate('Send confirmed invitations')}
        </Dropdown.Item>
        <Dropdown.Item onClick={handleDirectInvite}>
          <span className="svg-icon svg-icon-2 me-2">
            <EnvelopeSimpleIcon weight="bold" />
          </span>
          {translate('Invite by email')}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
