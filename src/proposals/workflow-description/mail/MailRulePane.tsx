import {
  ArrowLeftIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { FORM_ERROR } from 'final-form';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Form } from 'react-final-form';
import {
  CallWorkflowStep,
  callWorkflowStepNotificationRulesCreate,
  callWorkflowStepNotificationRulesDestroy,
  callWorkflowStepNotificationRulesPartialUpdate,
  CallWorkflowStepNotificationRule,
} from 'waldur-js-client';

import { AlertItem, Badge, BaseButton } from 'waldur-ui';

import { AddButton } from '@/core/AddButton';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { BooleanGroup, NumberGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useCallProposalRoles } from '@/proposals/proposal-roles/queries';
import { callWorkflowStepsKey } from '@/proposals/workflow/queries';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { PanelHeaderControls } from '../PanelHeaderControls';
import {
  callWorkflowCheckKey,
  callWorkflowDescriptionKey,
  callWorkflowHistoryKey,
} from '../queries';

import { fieldErrors } from './errors';
import { RECIPIENTS, recipientLabel, TRIGGERS, triggerLabel } from './labels';
import {
  MailTarget,
  stepRulesKey,
  useProposalTeamRoles,
  useStepRules,
} from './queries';

interface RuleValues {
  trigger: string;
  recipient: string;
  days_before?: number | null;
  is_enabled: boolean;
  proposal_role?: string | null;
  notified_proposal_roles: string[];
}

const NAMES_ROLE = ['proposal_role', 'proposal_role_lead'];
const RULE_FIELDS = [
  'trigger',
  'recipient',
  'days_before',
  'is_enabled',
  'proposal_role',
  'notified_proposal_roles',
];

const ruleSubmissionErrors = (error: unknown): Record<string, string> => {
  const errors = fieldErrors(error, RULE_FIELDS);
  if (!errors[FORM_ERROR]) {
    errors[FORM_ERROR] =
      Object.values(errors).join(' ') || translate('The rule was refused.');
  }
  return errors;
};

const isApplicantAudience = (recipient: string, step?: CallWorkflowStep) =>
  recipient === 'applicant' ||
  (recipient === 'responsible_role' && step?.completer === 'applicant');

const RuleForm: FC<{
  callUuid: string;
  step: CallWorkflowStep;
  rule?: CallWorkflowStepNotificationRule;
  defaults?: Partial<RuleValues>;
  footerSlot: HTMLElement | null;
  onDone(saved?: string): void;
}> = ({ callUuid, step, rule, defaults, footerSlot, onDone }) => {
  const formRef = useRef<HTMLFormElement>(null);
  // The form replaces the list: focus its first field, which a keyboard
  // user would otherwise have to find.
  useEffect(() => {
    const first = formRef.current?.querySelector<HTMLElement>(
      'input:not([type="hidden"]), button, select, textarea',
    );
    first?.focus();
  }, []);
  const queryClient = useQueryClient();
  const { showSuccess } = useNotify();
  const { data: evaluatorRoles = [] } = useCallProposalRoles(callUuid);
  const { data: teamRoles = [] } = useProposalTeamRoles();
  const initialValues = useMemo<RuleValues>(
    () =>
      rule
        ? {
            trigger: rule.trigger,
            recipient: rule.recipient,
            days_before: rule.days_before,
            is_enabled: rule.is_enabled ?? true,
            proposal_role: rule.proposal_role ?? null,
            notified_proposal_roles: rule.notified_proposal_roles ?? [],
          }
        : {
            trigger: 'step_started',
            recipient: 'call_managers',
            days_before: null,
            is_enabled: true,
            proposal_role: null,
            notified_proposal_roles: [],
            ...defaults,
          },
    [rule, defaults],
  );

  const onSubmit = async (values: RuleValues) => {
    const body = {
      trigger: values.trigger as any,
      recipient: values.recipient as any,
      days_before:
        values.trigger === 'deadline_approaching'
          ? (values.days_before ?? null)
          : null,
      is_enabled: values.is_enabled,
      proposal_role: NAMES_ROLE.includes(values.recipient)
        ? (values.proposal_role ?? null)
        : null,
      notified_proposal_roles: isApplicantAudience(values.recipient, step)
        ? values.notified_proposal_roles
        : [],
    };
    let saved: string | undefined;
    try {
      if (rule) {
        await callWorkflowStepNotificationRulesPartialUpdate({
          path: { uuid: rule.uuid },
          body,
        });
        saved = rule.uuid;
      } else {
        const response = await callWorkflowStepNotificationRulesCreate({
          body: { ...body, workflow_step: step.uuid },
        });
        saved = response.data?.uuid;
      }
    } catch (error) {
      return ruleSubmissionErrors(error);
    }
    await Promise.all(
      [
        stepRulesKey(callUuid, step.key),
        callWorkflowDescriptionKey(callUuid),
        callWorkflowCheckKey(callUuid),
        callWorkflowHistoryKey(callUuid),
        callWorkflowStepsKey(callUuid),
      ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );
    showSuccess(
      rule ? translate('Notification rule updated.') : translate('Rule added.'),
    );
    onDone(saved);
  };

  return (
    <Form<RuleValues>
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, values, submitting, submitError, pristine }) => (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          data-testid="mail-rule-form"
        >
          {submitError && (
            <AlertItem variant="error" title={submitError} className="mb-3" />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
            <div>
              <SelectGroup
                name="trigger"
                label={translate('Event')}
                simpleValue
                options={TRIGGERS.map((value) => ({
                  value,
                  label: triggerLabel(value),
                }))}
                isClearable={false}
              />
            </div>
            <div>
              <SelectGroup
                name="recipient"
                label={translate('Audience')}
                simpleValue
                options={RECIPIENTS.map((value) => ({
                  value,
                  label: recipientLabel(value),
                }))}
                isClearable={false}
              />
            </div>
          </div>
          {values.trigger === 'deadline_approaching' && (
            <NumberGroup
              name="days_before"
              label={translate('Days before the deadline')}
              min={0}
              max={365}
            />
          )}
          {NAMES_ROLE.includes(values.recipient) && (
            <SelectGroup
              name="proposal_role"
              label={translate('Evaluator role')}
              simpleValue
              options={evaluatorRoles.map((role) => ({
                value: role.uuid,
                label: role.name,
              }))}
            />
          )}
          {isApplicantAudience(values.recipient, step) && (
            <SelectGroup
              name="notified_proposal_roles"
              label={translate('Proposal roles told')}
              description={translate(
                'Empty tells the proposal creator and its whole team.',
              )}
              simpleValue
              isMulti
              options={teamRoles.map((role) => ({
                value: role.name,
                label: role.description || role.name,
              }))}
            />
          )}
          <BooleanGroup name="is_enabled" label={translate('Enabled')} />
          {footerSlot &&
            createPortal(
              <>
                <BaseButton
                  variant="tertiary"
                  size="lg"
                  className="min-w-[var(--dialog-action-min-w)]"
                  label={translate('Cancel')}
                  onClick={() => onDone()}
                />
                <BaseButton
                  variant="primary"
                  size="lg"
                  className="min-w-[var(--dialog-action-min-w)]"
                  label={rule ? translate('Save rule') : translate('Add rule')}
                  pending={submitting}
                  disabled={submitting || (Boolean(rule) && pristine)}
                  disabledReason={
                    rule && pristine
                      ? translate('Change a value to enable saving.')
                      : undefined
                  }
                  onClick={() => handleSubmit()}
                  data-testid="mail-rule-save"
                />
              </>,
              footerSlot,
            )}
        </form>
      )}
    />
  );
};

/**
 * The step's notification rules: who is told of which of its events, the
 * one sending the mail the page is about marked. Editing or adding a rule
 * shows its form in place of the list, with Save and Cancel at the foot of
 * the panel; saving goes back to the list with the rule highlighted.
 */
export const MailRulePane: FC<{
  callUuid: string;
  step: CallWorkflowStep;
  target: MailTarget;
  footerSlot: HTMLElement | null;
  onEditingChange(editing: boolean): void;
}> = ({ callUuid, step, target, footerSlot, onEditingChange }) => {
  const { data: rules, isLoading, refetch } = useStepRules(callUuid, step.key);
  const queryClient = useQueryClient();
  const { confirm } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  // null: the list; 'new': adding a rule; a uuid: editing that rule.
  const [editing, setEditing] = useState<string | null>(null);
  // The rule just saved, highlighted for a moment once the list is back.
  const [saved, setSaved] = useState<string | null>(null);
  const editedRule =
    editing && editing !== 'new'
      ? rules?.find((rule) => rule.uuid === editing)
      : undefined;
  const isEditing = editing === 'new' || Boolean(editedRule);

  useEffect(() => {
    onEditingChange(isEditing);
  }, [isEditing, onEditingChange]);
  useEffect(() => () => onEditingChange(false), [onEditingChange]);
  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(null), 2500);
    return () => window.clearTimeout(timer);
  }, [saved]);

  const tableProps = useTable<CallWorkflowStepNotificationRule>({
    table: `MailRuleTable-${step.uuid}`,
    fetchData: () =>
      Promise.resolve({ rows: rules ?? [], resultCount: rules?.length ?? 0 }),
  });

  const remove = async (rule: CallWorkflowStepNotificationRule) => {
    try {
      await confirm(
        translate('Delete rule'),
        translate('Stop mailing {audience} when {event}?', {
          audience: recipientLabel(rule.recipient),
          event: triggerLabel(rule.trigger, rule.days_before).toLowerCase(),
        }),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      await callWorkflowStepNotificationRulesDestroy({
        path: { uuid: rule.uuid },
      });
    } catch (error) {
      showErrorResponse(error, translate('Unable to delete the rule.'));
      return;
    }
    await Promise.all(
      [
        stepRulesKey(callUuid, step.key),
        callWorkflowDescriptionKey(callUuid),
        callWorkflowCheckKey(callUuid),
        callWorkflowHistoryKey(callUuid),
      ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );
    showSuccess(translate('Rule deleted.'));
  };

  const isThisMail = (rule: CallWorkflowStepNotificationRule) =>
    rule.trigger === target.trigger &&
    rule.recipient === target.recipient &&
    (target.daysBefore == null || rule.days_before === target.daysBefore);

  const columns: Column<CallWorkflowStepNotificationRule>[] = [
    {
      title: translate('Event'),
      render: ({ row }) => <>{triggerLabel(row.trigger, row.days_before)}</>,
    },
    {
      title: translate('Audience'),
      render: ({ row }) => (
        <>
          {recipientLabel(row.recipient)}
          {row.proposal_role_name ? ` (${row.proposal_role_name})` : ''}
          {isThisMail(row) && (
            <Badge
              variant="primary"
              size="sm"
              shape="pill"
              tone="outline"
              className="ms-1.5"
              data-testid="mail-rule-this-mail"
            >
              {translate('This mail')}
            </Badge>
          )}
        </>
      ),
    },
    {
      title: translate('State'),
      render: ({ row }) =>
        row.is_enabled === false ? (
          <Badge variant="neutral" size="sm" shape="pill" tone="outline">
            {translate('Disabled')}
          </Badge>
        ) : (
          <Badge variant="success" size="sm" shape="pill" tone="outline">
            {translate('Enabled')}
          </Badge>
        ),
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  if (isEditing) {
    return (
      <div className="flex flex-col gap-3" data-testid="mail-rule-editor">
        <div className="flex flex-wrap items-center gap-1.5">
          <BaseButton
            variant="text-primary"
            size="sm"
            className="p-0"
            iconNode={<ArrowLeftIcon weight="bold" />}
            label={translate('Back to rules')}
            onClick={() => setEditing(null)}
          />
          <h6 className="mb-0 ms-auto">
            {editedRule
              ? translate('Edit rule: {event} → {audience}', {
                  event: triggerLabel(
                    editedRule.trigger,
                    editedRule.days_before,
                  ),
                  audience: recipientLabel(editedRule.recipient),
                })
              : translate('Add a rule to {step}', {
                  step: target.stepName ?? step.name,
                })}
          </h6>
        </div>
        <RuleForm
          key={editing ?? 'none'}
          callUuid={callUuid}
          step={step}
          rule={editedRule}
          defaults={
            editedRule
              ? undefined
              : {
                  trigger: target.trigger,
                  recipient: target.recipient,
                  days_before: target.daysBefore ?? null,
                }
          }
          footerSlot={footerSlot}
          onDone={(uuid) => {
            setEditing(null);
            if (uuid) setSaved(uuid);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <PanelHeaderControls className="flex justify-end">
        <AddButton onClick={() => setEditing('new')} />
      </PanelHeaderControls>
      <Table<CallWorkflowStepNotificationRule>
        {...tableProps}
        rows={rules ?? []}
        columns={columns}
        verboseName={translate('Notification rules')}
        hideTitle
        hasActionBar={false}
        // The dialog draws the table's one border; no card frame around it.
        cardBordered={false}
        bodyClassName="p-0"
        hasPagination={false}
        placeholderHasRetry={false}
        rowVariant={({ row }) => (row.uuid === saved ? 'success' : undefined)}
        rowActions={({ row }) => (
          <ActionsDropdown row={row} refetch={refetch}>
            <ActionItem
              title={translate('Edit')}
              action={() => setEditing(row.uuid)}
              iconNode={<PencilSimpleIcon weight="bold" />}
            />
            <ActionItem
              title={translate('Delete')}
              action={() => remove(row)}
              iconNode={<TrashIcon weight="bold" />}
              iconColor="danger"
              className="text-danger"
            />
          </ActionsDropdown>
        )}
      />
    </div>
  );
};
