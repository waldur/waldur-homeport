import {
  ClockIcon,
  PencilSimpleIcon,
  TicketIcon,
  XIcon,
} from '@phosphor-icons/react';
import { FC, useId } from 'react';

import { AlertItem, BaseButton } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { asSent, TicketDraft, TicketDraftOutcome } from './parseTicketDraft';
import { useServerTicketDraft } from './useServerTicketDraft';
import {
  TicketDraftState,
  useTicketDraftActions,
} from './useTicketDraftActions';

interface TicketDraftCardProps {
  draft: TicketDraft;
  /** The current user asked for this draft and may send or edit it. */
  isRequester: boolean;
  /** What the bot reported became of the draft, if it has. */
  outcome?: TicketDraftOutcome;
}

const DraftState: FC<{ state: TicketDraftState }> = ({ state }) => {
  switch (state.state) {
    case 'created': {
      const label = state.issueKey
        ? translate('Ticket {key} created.', { key: state.issueKey })
        : translate('Ticket created.');
      return (
        <div className="text-xs" role="status">
          {state.issueUuid ? (
            <Link
              state="support.detail"
              params={{ issue_uuid: state.issueUuid }}
              label={label}
            />
          ) : (
            label
          )}
        </div>
      );
    }
    case 'cancelled':
      return (
        <div className="text-xs text-quaternary" role="status">
          {translate('This draft was canceled.')}
        </div>
      );
    case 'expired':
      return (
        <div className="text-xs text-quaternary" role="status">
          {translate('This draft has expired.')}
        </div>
      );
    default:
      return null;
  }
};

/**
 * A support ticket the bot drafted from a chat thread. Its text came from the
 * conversation or a model, so it is shown as plain text: no markup, and no
 * links.
 */
export const TicketDraftCard: FC<TicketDraftCardProps> = ({
  draft: eventDraft,
  isRequester,
  outcome,
}) => {
  const server = useServerTicketDraft(eventDraft, isRequester, outcome);
  if (server.loading) {
    return (
      <div
        className="flex flex-col gap-3 min-w-[240px]"
        data-testid="ticket-draft-card"
      >
        <LoadingSpinner />
      </div>
    );
  }
  if (server.failed) {
    return (
      <div
        className="flex flex-col gap-3 min-w-[240px]"
        data-testid="ticket-draft-card"
      >
        <LoadingErred
          message={translate("Couldn't load this draft.")}
          loadData={() => server.retry()}
        />
      </div>
    );
  }
  // Only a draft Waldur gives the requester can be sent or edited.
  if (server.draft) {
    return <TicketDraftView draft={server.draft} canAct outcome={outcome} />;
  }
  const closedOutcome = outcome ?? server.outcome ?? undefined;
  return (
    <TicketDraftView
      draft={asSent(eventDraft, closedOutcome)}
      canAct={false}
      readOnlyNote={
        isRequester
          ? translate('This draft can no longer be sent from here.')
          : translate('Only the member who asked for this draft can send it.')
      }
      outcome={closedOutcome}
    />
  );
};

const TicketDraftView: FC<{
  draft: TicketDraft;
  canAct: boolean;
  /** Why there are no actions, on a card still pending. */
  readOnlyNote?: string;
  outcome?: TicketDraftOutcome;
}> = ({ draft, canAct, readOnlyNote, outcome }) => {
  const { state, create, edit, cancel, creating, cancelling, gone } =
    useTicketDraftActions(draft, outcome);
  const pending = state.state === 'pending';
  const actionable = canAct && !gone;
  const busy = creating || cancelling;
  const busyReason = creating
    ? translate('The ticket is being created.')
    : translate('The draft is being canceled.');
  const note = gone
    ? translate('This draft can no longer be sent from here.')
    : readOnlyNote;

  const titleId = useId();

  return (
    <div
      className="flex flex-col gap-3 min-w-[240px]"
      data-testid="ticket-draft-card"
      role="group"
      aria-labelledby={titleId}
    >
      <div className="flex flex-col gap-1">
        <div
          className="flex items-center gap-1.5 text-xs text-secondary font-semibold uppercase tracking-[0.04em]"
          data-testid="ticket-draft-header"
        >
          <TicketIcon weight="bold" className="size-4 shrink-0" />
          <span>{translate('Support ticket draft')}</span>
        </div>
        <div className="font-semibold" id={titleId}>
          {draft.title}
        </div>
      </div>
      {/* Focusable, so a keyboard can scroll a long description too. */}
      {/* eslint-disable jsx-a11y/no-noninteractive-tabindex */}
      <div
        className="whitespace-pre-wrap [overflow-wrap:anywhere] max-h-52 overflow-y-auto"
        tabIndex={0}
      >
        {draft.description}
      </div>
      {/* eslint-enable jsx-a11y/no-noninteractive-tabindex */}
      <dl className="grid grid-cols-[max-content_1fr] gap-y-1 gap-x-2.5 m-0 text-xs [&>dt]:font-medium [&>dt]:text-secondary [&>dd]:m-0 [&>dd]:min-w-0 [&>dd]:[overflow-wrap:anywhere]">
        {draft.requestType && (
          <>
            <dt>{translate('Request type')}</dt>
            <dd>{draft.requestType}</dd>
          </>
        )}
        {draft.priority && (
          <>
            <dt>{translate('Suggested priority')}</dt>
            <dd>{draft.priority}</dd>
          </>
        )}
        {draft.project && (
          <>
            <dt>{translate('Project')}</dt>
            <dd>{draft.project.name}</dd>
          </>
        )}
        {draft.resource && (
          <>
            <dt>{translate('Resource')}</dt>
            <dd>{draft.resource.name}</dd>
          </>
        )}
        {draft.helpdesk && (
          <>
            <dt>{translate('Helpdesk')}</dt>
            <dd>{draft.helpdesk}</dd>
          </>
        )}
      </dl>
      <AlertItem
        variant="info"
        type="floating"
        iconSize="sm"
        iconClassName="mt-0"
        className="p-2.5"
        title={
          draft.helpdesk
            ? translate(
                'A summary of this conversation will be sent to {helpdesk}.',
                { helpdesk: draft.helpdesk },
              )
            : translate(
                'A summary of this conversation will be sent to the helpdesk.',
              )
        }
      />
      {pending && draft.expiresAt && (
        <div className="flex items-center gap-1.5 text-xs text-secondary">
          <ClockIcon weight="bold" className="size-4 shrink-0" />
          <span>
            {translate('Expires at {time}', {
              time: formatDateTime(draft.expiresAt),
            })}
          </span>
        </div>
      )}
      <DraftState state={state} />
      {pending && actionable && (
        <div className="flex gap-1.5" data-testid="ticket-draft-actions">
          <BaseButton
            label={translate('Create ticket')}
            iconNode={<TicketIcon weight="bold" />}
            variant="primary"
            size="sm"
            onClick={create}
            pending={creating}
            disabled={cancelling}
            disabledReason={translate('The draft is being canceled.')}
          />
          <BaseButton
            label={translate('Edit')}
            iconNode={<PencilSimpleIcon weight="bold" />}
            variant="tertiary"
            size="sm"
            onClick={edit}
            disabled={busy}
            disabledReason={busyReason}
          />
          <BaseButton
            label={translate('Cancel draft')}
            iconNode={<XIcon weight="bold" />}
            variant="tertiary-ghost"
            size="sm"
            onClick={cancel}
            pending={cancelling}
            disabled={creating}
            disabledReason={translate('The ticket is being created.')}
          />
        </div>
      )}
      {pending && note && <div className="text-xs text-quaternary">{note}</div>}
    </div>
  );
};
