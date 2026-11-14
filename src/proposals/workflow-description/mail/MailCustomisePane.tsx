import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Form, useFormState } from 'react-final-form';
import { useSelector } from 'react-redux';
import {
  CallNotificationMailType,
  NotificationPreview,
  NotificationVariable,
  proposalProtectedCallsNotificationOverridesDestroy,
  proposalProtectedCallsNotificationOverridesSet,
  proposalProtectedCallsNotificationPreviewDraft,
} from 'waldur-js-client';

import { AlertItem, BaseButton, Code } from 'waldur-ui';

import { Link } from '@/core/Link';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { useDebouncedValue } from '@/core/useDebouncedValue';
import { BooleanGroup, MonacoGroup, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { isStaff } from '@/workspace/selectors';

import { FixedHeightTabs } from '../FixedHeightTabs';
import { callWorkflowDescriptionKey, callWorkflowHistoryKey } from '../queries';

import { fieldErrors } from './errors';
import { MailView } from './MailView';
import {
  MailTarget,
  mailTypesKey,
  previewQuery,
  useMailTypes,
  retryBusyPreview,
} from './queries';

interface WordingValues {
  subject: string;
  body_text: string;
  body_html: string;
  enabled: boolean;
}

const WORDING_FIELDS = ['subject', 'body_text', 'body_html', 'enabled'];

// The bodies' editors, and the most a longer tab takes before it scrolls:
// the tabs keep one height, so the tallest sets it for all.
const EDITOR_HEIGHT = 400;

const wordingErrors = (error: unknown) => fieldErrors(error, WORDING_FIELDS);

const VariablesTable: FC<{ mailType: CallNotificationMailType }> = ({
  mailType,
}) => {
  const rows = mailType.variables;
  const tableProps = useTable<NotificationVariable>({
    table: `MailVariables-${mailType.key}`,
    fetchData: () => Promise.resolve({ rows, resultCount: rows.length }),
  });
  const columns: Column<NotificationVariable>[] = [
    {
      title: translate('Variable'),
      render: ({ row }) => <Code>{`{{ ${row.name} }}`}</Code>,
    },
    {
      title: translate('Description'),
      render: ({ row }) => <>{row.description}</>,
    },
  ];
  return (
    <>
      <p className="text-quaternary text-sm mb-3">
        {translate(
          'Only these reach the wording, as the recipient would read them. Tags: if, for, with, firstof, now, cycle; filters such as date, default, join, pluralize, upper, lower, linebreaksbr.',
        )}
      </p>
      <Table<NotificationVariable>
        {...tableProps}
        rows={rows}
        columns={columns}
        rowKey="name"
        verboseName={translate('variables')}
        hideTitle
        hasActionBar={false}
        cardBordered={false}
        bodyClassName="p-0"
        hasPagination={false}
        placeholderHasRetry={false}
      />
    </>
  );
};

/** The draft rendered on the server as the mail would be, while editing. */
const DraftPreview: FC<{ callUuid: string; target: MailTarget }> = ({
  callUuid,
  target,
}) => {
  const { values } = useFormState<WordingValues>({
    subscription: { values: true },
  });
  const draft = useDebouncedValue(
    {
      subject: values.subject ?? '',
      body_text: values.body_text ?? '',
      body_html: values.body_html ?? '',
    },
    600,
  );
  const draftKey = JSON.stringify(draft);
  const { data, error, isFetching } = useQuery<NotificationPreview>({
    queryKey: ['callMailDraftPreview', callUuid, target, draftKey],
    queryFn: () =>
      proposalProtectedCallsNotificationPreviewDraft({
        path: { uuid: callUuid },
        body: { ...(previewQuery(target) as any), ...draft },
      }).then((response) => response.data),
    enabled: Boolean(draft.subject.trim() && draft.body_text.trim()),
    retry: retryBusyPreview,
    retryDelay: 600,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
  });
  const errors = error ? wordingErrors(error) : null;
  return (
    <div data-testid="mail-draft-preview">
      {isFetching && (
        <p className="text-sm text-quaternary mb-1.5">
          {translate('Rendering…')}
        </p>
      )}
      {errors ? (
        <AlertItem
          variant="error"
          title={translate('The wording cannot be rendered.')}
          body={Object.values(errors).join(' ')}
        />
      ) : data ? (
        <MailView mail={data} htmlOnly />
      ) : (
        <p className="text-quaternary text-sm">
          {translate('Give a subject and a text body to see the mail.')}
        </p>
      )}
    </div>
  );
};

/**
 * The call's own wording of the mail: subject, text and HTML bodies, with
 * the variables it may use and a live preview rendered on the server.
 * Saving validates it there; reset goes back to the portal's wording.
 */
export const MailCustomisePane: FC<{
  callUuid: string;
  mailKey: string;
  target: MailTarget;
  /** Where Save and Reset go, always in sight. */
  footerSlot?: HTMLElement | null;
  /** Where the line saying whose wording this is goes. */
  statusSlot?: HTMLElement | null;
}> = ({ callUuid, mailKey, target, footerSlot, statusSlot }) => {
  const { data: mailTypes, isLoading } = useMailTypes(callUuid);
  const mailType = mailTypes?.find((row) => row.key === mailKey);
  const queryClient = useQueryClient();
  const { showSuccess, showErrorResponse } = useNotify();
  const { confirm } = useModal();
  const staff = useSelector(isStaff);
  const override = mailType?.override;

  const initialValues = useMemo<WordingValues | undefined>(
    () =>
      mailType
        ? override
          ? {
              subject: override.subject,
              body_text: override.body_text,
              body_html: override.body_html ?? '',
              enabled: override.enabled ?? true,
            }
          : {
              subject: mailType.portal_wording.subject,
              body_text: mailType.portal_wording.body_text,
              body_html: mailType.portal_wording.body_html,
              enabled: true,
            }
        : undefined,
    [mailType, override],
  );

  const refresh = () =>
    Promise.all(
      [
        mailTypesKey(callUuid),
        ['callMailPreview', callUuid],
        callWorkflowDescriptionKey(callUuid),
        callWorkflowHistoryKey(callUuid),
      ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );

  const onSubmit = async (values: WordingValues) => {
    try {
      await proposalProtectedCallsNotificationOverridesSet({
        path: { uuid: callUuid },
        body: {
          mail_type: mailType!.mail_type,
          variant: mailType!.variant,
          ...values,
        },
      });
    } catch (error) {
      const errors = wordingErrors(error);
      if (Object.keys(errors).length) return errors;
      showErrorResponse(error, translate('Unable to save the wording.'));
      return;
    }
    await refresh();
    showSuccess(translate('The call now words this mail itself.'));
  };

  const reset = async () => {
    if (!override) return;
    try {
      await confirm(
        translate('Reset to default'),
        translate(
          "This call's own wording of the mail is removed: the portal's wording is sent instead.",
        ),
      );
    } catch {
      return;
    }
    try {
      await proposalProtectedCallsNotificationOverridesDestroy({
        path: { uuid: callUuid, obj_uuid: override.uuid },
      });
    } catch (error) {
      showErrorResponse(error, translate('Unable to reset the wording.'));
      return;
    }
    await refresh();
    showSuccess(translate("The portal's wording is sent again."));
  };

  if (isLoading) return <LoadingSpinner />;
  if (!mailType || !initialValues) {
    return (
      <AlertItem
        variant="warning"
        title={translate('A call cannot word this mail itself.')}
      />
    );
  }
  return (
    <Form<WordingValues>
      onSubmit={onSubmit}
      initialValues={initialValues}
      keepDirtyOnReinitialize={false}
      render={({ handleSubmit, submitting, pristine, submitError, form }) => (
        <form onSubmit={handleSubmit} data-testid="mail-customise-form">
          {statusSlot &&
            createPortal(
              override
                ? translate(
                    'This call words the mail itself. Last changed by {who}.',
                    { who: override.updated_by_name ?? '—' },
                  )
                : mailType.portal_overridden
                  ? translate(
                      "Starts from the portal's wording, which staff changed for the whole portal.",
                    )
                  : translate("Starts from the portal's wording."),
              statusSlot,
            )}
          {submitError && (
            <AlertItem variant="error" title={submitError} className="mb-3" />
          )}
          {target.step && (
            // A step's mail is one wording for every step and event that
            // sends it: the page is opened on one of them.
            <AlertItem
              variant="info"
              className="mb-3"
              data-testid="mail-wording-scope"
              title={translate('Shared by every step of this call')}
              body={translate(
                'This is the wording of "{kind}". Saving it changes that mail for every step and event of this call, not only this one.',
                { kind: mailType.label },
              )}
            />
          )}
          {/* Only the call's own wording can be switched off: until it is
              saved, the portal's wording is sent and there is none. */}
          {override && (
            <BooleanGroup
              name="enabled"
              label={translate("Send this call's wording")}
              description={translate(
                "Switched off, the portal's wording is sent and this one kept.",
              )}
            />
          )}
          {/* Laid out as the portal's own template editor (Administration >
              Notifications): a tab per part, each the full width. */}
          <FixedHeightTabs
            items={[
              {
                value: 'subject',
                title: translate('Subject'),
                content: (
                  // A multi-line box, as the portal's template editor
                  // gives a subject: the wording runs long.
                  <TextGroup
                    name="subject"
                    required
                    rows={4}
                    maxLength={2000}
                  />
                ),
              },
              {
                value: 'text',
                title: translate('Plain text message'),
                content: (
                  <MonacoGroup
                    name="body_text"
                    required
                    language="django-html"
                    height={EDITOR_HEIGHT}
                  />
                ),
              },
              {
                value: 'html',
                title: translate('HTML message'),
                content: (
                  <MonacoGroup
                    name="body_html"
                    language="django-html"
                    height={EDITOR_HEIGHT}
                    description={translate(
                      'Values are escaped. Left empty, the plain text message is sent as HTML too.',
                    )}
                  />
                ),
              },
              {
                value: 'variables',
                title: translate('Available variables'),
                content: (
                  <div
                    className="overflow-y-auto"
                    style={{ maxHeight: EDITOR_HEIGHT }}
                  >
                    <VariablesTable mailType={mailType} />
                  </div>
                ),
              },
              {
                value: 'preview',
                title: translate('Preview'),
                content: <DraftPreview callUuid={callUuid} target={target} />,
              },
            ]}
          />
          {footerSlot &&
            createPortal(
              <>
                {staff && (
                  <Link
                    state="support-notification-messages"
                    label={translate("Edit the portal's wording")}
                    className="me-1.5"
                  />
                )}
                {override && (
                  <BaseButton
                    variant="tertiary"
                    size="lg"
                    label={translate("Start from the portal's wording")}
                    onClick={() => {
                      form.change('subject', mailType.portal_wording.subject);
                      form.change(
                        'body_text',
                        mailType.portal_wording.body_text,
                      );
                      form.change(
                        'body_html',
                        mailType.portal_wording.body_html,
                      );
                    }}
                  />
                )}
                {override && (
                  <BaseButton
                    variant="danger"
                    size="lg"
                    label={translate('Reset to default')}
                    iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
                    onClick={reset}
                  />
                )}
                <BaseButton
                  variant="primary"
                  size="lg"
                  className="min-w-dialog-action"
                  label={translate('Save for this call')}
                  pending={submitting}
                  disabled={submitting || (Boolean(override) && pristine)}
                  disabledReason={
                    override && pristine
                      ? translate('Change the wording to enable saving.')
                      : undefined
                  }
                  onClick={() => handleSubmit()}
                  data-testid="mail-wording-save"
                />
              </>,
              footerSlot,
            )}
        </form>
      )}
    />
  );
};
