import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Field, useField } from 'react-final-form';

import {
  AlertItem,
  BaseButton,
  FormField,
  HelpIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
} from 'waldur-ui';

import { ENV } from '@/core/config';
import { usePagination } from '@/core/usePagination';
import { composeValidators, email, required } from '@/core/validators';
import { isFeatureVisible } from '@/features/connect';
import { InvitationsFeatures } from '@/FeaturesEnums';
import { EmailField } from '@/form/EmailField';
import { FieldError } from '@/form/FieldError';
import { FieldWarning } from '@/form/FieldWarning';
import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';
import {
  ExistingRoleHit,
  getExistingRoleMessage,
} from '@/permissions/existingRoles';

import { findVerdictForRow, RowVerdict } from '../rowVerdicts';

import { RoleAndProjectSelectField } from './RoleAndProjectSelectField';
import {
  FlaggedRow,
  getFlaggedRows,
  getRowFeedback,
  VerdictLists,
} from './rowFeedback';

const getRowIndexFromFieldName = (fieldName: string): number | null => {
  if (!fieldName || typeof fieldName !== 'string') return null;
  const bracket = fieldName.match(/^rows\[(\d+)\]\.email$/);
  if (bracket) return parseInt(bracket[1], 10);
  const dot = fieldName.match(/^rows\.(\d+)\.email$/);
  if (dot) return parseInt(dot[1], 10);
  return null;
};

const getRoleUuidForRow = (allValues: any, rowIndex: number): string | null => {
  const row = allValues?.rows?.[rowIndex];
  return row?.role_project?.role?.uuid ?? null;
};

/** Duplicate (email + role + project) in form – only show error while the pair still appears more than once */
const duplicateInFormValidator = (
  value: string,
  allValues: any,
  fieldName: string,
) => {
  if (!value) return undefined;
  const list = allValues?._duplicateInFormEmails as
    | Array<{ email: string; roleUuid: string; projectUuid?: string }>
    | undefined;
  if (!Array.isArray(list)) return undefined;
  const rowIndex = getRowIndexFromFieldName(fieldName);
  if (rowIndex == null) return undefined;
  const roleUuid = getRoleUuidForRow(allValues, rowIndex);
  const projectUuid = allValues?.rows?.[rowIndex]?.role_project?.project?.uuid;
  const flagged = list.find(
    (p) =>
      p.email === value &&
      p.roleUuid === roleUuid &&
      (!p.projectUuid || p.projectUuid === projectUuid),
  );
  if (!flagged) return undefined;
  const rows = allValues?.rows ?? [];
  const count = rows.filter(
    (row: {
      email?: string;
      role_project?: { role?: { uuid?: string }; project?: { uuid?: string } };
    }) =>
      row?.email === value &&
      row?.role_project?.role?.uuid === roleUuid &&
      (!flagged.projectUuid ||
        row?.role_project?.project?.uuid === projectUuid),
  ).length;
  if (count <= 1) return undefined;
  return translate(
    'This email and role combination is entered more than once.',
  );
};

/** Pending invitation from API – set after check-duplicates response. The result only invalidates the row; RowFeedback renders the message. */
const duplicateInvitationValidator = (
  value: string,
  allValues: any,
  fieldName: string,
) => {
  if (!value) return undefined;
  const rowIndex = getRowIndexFromFieldName(fieldName);
  if (rowIndex == null) return undefined;
  const pending = findVerdictForRow(
    allValues?._duplicateEmails as RowVerdict[] | undefined,
    allValues?.rows?.[rowIndex],
  );
  if (pending) {
    return {
      __pendingInvitation: true,
      message: translate('This email already has a pending invitation.'),
    };
  }
  return undefined;
};

/** Role already held in the target scope, blocking – set after check-duplicates response. Rendered by RowFeedback, like the pending invitation. */
const existingRoleBlockValidator = (
  value: string,
  allValues: any,
  fieldName: string,
) => {
  if (!value) return undefined;
  const rowIndex = getRowIndexFromFieldName(fieldName);
  if (rowIndex == null) return undefined;
  const hit = findVerdictForRow(
    allValues?._existingRoleBlocks as ExistingRoleHit[] | undefined,
    allValues?.rows?.[rowIndex],
  );
  if (!hit) return undefined;
  return {
    __existingRoleBlock: true,
    message: getExistingRoleMessage(hit),
  };
};

const getFeedbackColSpan = () =>
  isFeatureVisible(InvitationsFeatures.conceal_civil_number) ? 3 : 4;

/**
 * The verdict lists Continue writes into the form values. Only their values
 * are subscribed, so typing in a row does not re-render every subscriber.
 */
const useVerdictLists = (): VerdictLists => {
  const subscription = { subscription: { value: true } };
  return {
    inForm: useField<RowVerdict[]>('_duplicateInFormEmails', subscription).input
      .value,
    pending: useField<RowVerdict[]>('_duplicateEmails', subscription).input
      .value,
    blocks: useField<ExistingRoleHit[]>('_existingRoleBlocks', subscription)
      .input.value,
    warnings: useField<ExistingRoleHit[]>('_existingRoleWarnings', subscription)
      .input.value,
  };
};

/**
 * The server verdicts for one row, rendered as a full-width row under it.
 *
 * Read from form values rather than from the field's error: a row on another
 * page is unmounted when Continue records the verdicts, and on remount its
 * error reaches the field state but not a second subscriber rendering it, so
 * the message went missing while Continue stayed disabled. Warnings could not
 * be validator results anyway – any truthy result invalidates the form, which
 * is what gates Continue. Only this row's email and role and the verdict lists
 * are subscribed, so typing elsewhere does not re-render every row.
 */
const RowFeedbackRow = ({ name, rows }: { name: string; rows: any[] }) => {
  const lists = useVerdictLists();
  const {
    input: { value: email },
  } = useField<string>(`${name}.email`, { subscription: { value: true } });
  const {
    input: { value: roleProject },
  } = useField(`${name}.role_project`, { subscription: { value: true } });

  const feedback = getRowFeedback(
    { email, role_project: roleProject },
    rows,
    lists,
  );
  if (!feedback) return null;
  return (
    <TableRow className="text-sm" divided={false}>
      <TableCell
        colSpan={getFeedbackColSpan()}
        className="border-0 pt-0 pb-1.5"
      >
        {feedback.blocking ? (
          <FieldError error={feedback.message} />
        ) : (
          <FieldWarning error={feedback.message} />
        )}
      </TableCell>
    </TableRow>
  );
};

/** The rows the summary and the automatic jump point at: blocking ones first. */
const getRowsToReveal = (flagged: FlaggedRow[]) => {
  const blocking = flagged.filter((row) => row.blocking);
  return blocking.length ? blocking : flagged;
};

/**
 * Continue writes its verdicts next to the rows, but the rows are paginated
 * and the dialog body scrolls: a verdict off screen would leave Continue
 * looking like it did nothing. Whenever a new set of verdicts arrives, bring
 * the first flagged row into view and focus its email, preferring one on the
 * current page.
 */
const useRevealFlaggedRow = (
  rows: any[] | undefined,
  lists: VerdictLists,
  page: number,
  pageSize: number,
  setPage: (page: number) => void,
) => {
  const rowRefs = useRef(new Map<number, HTMLTableRowElement>());
  const [target, setTarget] = useState<number | null>(null);

  const revealRow = useCallback(
    (index: number) => {
      const rowPage = Math.floor(index / pageSize) + 1;
      if (rowPage !== page) setPage(rowPage);
      setTarget(index);
    },
    [page, pageSize, setPage],
  );

  // Runs once the row's page has rendered, so its element exists.
  useEffect(() => {
    if (target === null) return;
    const row = rowRefs.current.get(target);
    if (!row) return;
    row.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    row.querySelector('input')?.focus({ preventScroll: true });
    setTarget(null);
  }, [target, page]);

  useEffect(() => {
    const candidates = getRowsToReveal(getFlaggedRows(rows, lists));
    if (!candidates.length) return;
    const start = (page - 1) * pageSize;
    const onPage = candidates.find(
      ({ index }) => index >= start && index < start + pageSize,
    );
    revealRow((onPage ?? candidates[0]).index);
    // Keyed on the verdicts only: paging away from a flagged row, or editing
    // one, must not pull the page back.
  }, [lists.inForm, lists.pending, lists.blocks, lists.warnings]);

  return { rowRefs, revealRow };
};

/**
 * One line next to the footer that says why Continue is disabled (or held
 * once for warnings), so the inviter does not have to find the flagged rows
 * in a long list to learn that anything is wrong.
 */
const FlaggedRowsSummary = ({
  flagged,
  onReveal,
}: {
  flagged: FlaggedRow[];
  onReveal: (index: number) => void;
}) => {
  const rows = getRowsToReveal(flagged);
  if (!rows.length) return null;
  const isBlocking = rows[0].blocking;
  const messages = Array.from(new Set(rows.map((row) => row.message)));
  const count = rows.length;

  const title = isBlocking
    ? count === 1
      ? translate('One row needs attention before you can continue.')
      : translate('{count} rows need attention before you can continue.', {
          count,
        })
    : count === 1
      ? translate('One row has a warning.')
      : translate('{count} rows have a warning.', { count });

  return (
    <AlertItem
      type="floating"
      variant={isBlocking ? 'error' : 'warning'}
      iconSize="md"
      className="mt-3"
      role="status"
      title={title}
      body={
        <>
          {messages.length === 1 ? (
            messages[0]
          ) : (
            <ul className="list-disc ps-4 mb-0">
              {messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}
          {!isBlocking && (
            <p className="mb-0">
              {translate(
                'Click Continue again to send the invitations anyway.',
              )}
            </p>
          )}
        </>
      }
      actions={
        <BaseButton
          variant="text-primary"
          onClick={() => onReveal(rows[0].index)}
          label={
            count === 1 ? translate('Go to row') : translate('Go to first row')
          }
        />
      }
    />
  );
};

export const EmailsListGroup = ({
  fields,
  roles,
  customer,
  project,
  disabled,
}) => {
  const [warn, setWarn] = useState(false);

  const {
    page,
    setPage,
    pageSize,
    changePageSize,
    visibleItems,
    refreshPageOnAdd,
    refreshPageOnRemove,
    hasPages,
  } = usePagination(fields);

  const lists = useVerdictLists();
  const { rowRefs, revealRow } = useRevealFlaggedRow(
    fields.value,
    lists,
    page,
    pageSize,
    setPage,
  );
  const flagged = getFlaggedRows(fields.value, lists);

  const addRow = useCallback(() => {
    let emptyEmails = 0;
    fields.value?.forEach((row) => {
      if (!row?.email) emptyEmails++;
    });

    if (emptyEmails < 5) {
      if (project) fields.push({ project });
      else fields.push({});
      refreshPageOnAdd();
    } else {
      setWarn(true);
      setTimeout(() => setWarn(false), 2000);
    }
  }, [fields, project, refreshPageOnAdd]);

  const isOnlyRow = fields.length === 1;

  const removeRow = (index) => {
    fields.remove(index);
    refreshPageOnRemove();
  };

  return (
    <div className="mb-2.5">
      <div id="emails-list-group">
        {fields.length > 0 && (
          <FormField>
            <Table
              scrollable={false}
              className="h-auto table-fixed align-top px-0 mb-0"
            >
              <TableHeader>
                <TableRow className="text-sm font-medium" divided={false}>
                  {/* Fixed-layout table: one column without a width takes
                      the free space, so Email does when Civil number is
                      hidden. */}
                  <TableHead
                    className={
                      isFeatureVisible(InvitationsFeatures.conceal_civil_number)
                        ? undefined
                        : 'w-[250px]'
                    }
                  >
                    {translate('Email')}
                  </TableHead>
                  {!isFeatureVisible(
                    InvitationsFeatures.conceal_civil_number,
                  ) && (
                    <TableHead>
                      {ENV.plugins.WALDUR_CORE.INVITATION_CIVIL_NUMBER_LABEL ||
                        translate('Civil number')}{' '}
                      <HelpIcon
                        label={translate(
                          'Must start with a country prefix ie EE34501234215',
                        )}
                      />
                    </TableHead>
                  )}
                  <TableHead className="w-[380px]">
                    {translate('Role')}
                  </TableHead>
                  <TableHead className="w-[54px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleItems.map((user, i) => {
                  if (!user) return null;
                  // Every row has a Role and a Project select; name them
                  // after the row so a screen reader can tell them apart.
                  const rowEmail = fields.value?.[i]?.email;
                  return (
                    <Fragment key={user}>
                      <TableRow
                        className="text-sm"
                        divided={false}
                        ref={(element) => {
                          if (element) rowRefs.current.set(i, element);
                          else rowRefs.current.delete(i);
                        }}
                      >
                        <TableCell>
                          <Field
                            name={`${user}.email`}
                            validate={(value, allValues, meta) => {
                              const err = composeValidators(
                                required,
                                email,
                              )(value);
                              if (err) return err;
                              const fieldName =
                                (meta as { name?: string })?.name ??
                                `${user}.email`;
                              const duplicateInForm = duplicateInFormValidator(
                                value,
                                allValues,
                                fieldName,
                              );
                              if (duplicateInForm) return duplicateInForm;
                              const pendingInvitation =
                                duplicateInvitationValidator(
                                  value,
                                  allValues,
                                  fieldName,
                                );
                              if (pendingInvitation) return pendingInvitation;
                              return existingRoleBlockValidator(
                                value,
                                allValues,
                                fieldName,
                              );
                            }}
                          >
                            {({ input, meta }) => (
                              <EmailField
                                input={input}
                                meta={meta}
                                placeholder={translate('Enter email address')}
                                required
                              />
                            )}
                          </Field>
                        </TableCell>
                        {isFeatureVisible(
                          InvitationsFeatures.conceal_civil_number,
                        ) ? null : (
                          <TableCell>
                            <Field
                              name={`${user}.civil_number`}
                              validate={
                                isFeatureVisible(
                                  InvitationsFeatures.civil_number_required,
                                )
                                  ? required
                                  : undefined
                              }
                            >
                              {({ input, meta }) => (
                                <InputField
                                  input={input}
                                  meta={meta}
                                  placeholder={translate('e.g. EE123456789')}
                                  disabled={disabled}
                                />
                              )}
                            </Field>
                          </TableCell>
                        )}
                        <TableCell>
                          <RoleAndProjectSelectField
                            name={`${user}.role_project`}
                            roles={roles}
                            customer={customer}
                            currentProject={project}
                            roleLabel={
                              rowEmail
                                ? translate('Role for {email}', {
                                    email: rowEmail,
                                  })
                                : translate('Role for row {number}', {
                                    number: i + 1,
                                  })
                            }
                            projectLabel={
                              rowEmail
                                ? translate('Project for {email}', {
                                    email: rowEmail,
                                  })
                                : translate('Project for row {number}', {
                                    number: i + 1,
                                  })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {/* aria-disabled, not disabled: an unavailable
                              button stays in the Tab order, so keyboard
                              users can still reach the reason. */}
                          <BaseButton
                            variant="text-danger"
                            onClick={() => !isOnlyRow && removeRow(i)}
                            aria-label={translate('Remove')}
                            aria-disabled={isOnlyRow || undefined}
                            data-disabled={isOnlyRow ? '' : undefined}
                            tooltip={
                              isOnlyRow
                                ? translate('At least one user is required')
                                : translate('Remove')
                            }
                            iconNode={<TrashIcon weight="bold" />}
                            size="lg"
                          />
                        </TableCell>
                      </TableRow>
                      <RowFeedbackRow name={user} rows={fields.value} />
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </FormField>
        )}
        <div>
          <BaseButton
            variant="text-primary"
            disabled={warn}
            disabledReason={translate(
              'Fill in empty email fields before adding more',
            )}
            onClick={addRow}
            label={
              fields.length > 0
                ? translate('Add another user')
                : translate('Add user')
            }
            iconNode={<PlusIcon weight="bold" />}
            size="lg"
          />
          {warn && (
            <span className="text-danger ms-1.5">
              {translate('Too many empty fields')}
            </span>
          )}
        </div>
      </div>

      <TablePagination
        currentPage={page}
        pageSize={pageSize}
        resultCount={fields.length}
        hasRows={hasPages}
        showPageSizeSelector
        updatePageSize={changePageSize}
        gotoPage={setPage}
        bordered={false}
      />

      <FlaggedRowsSummary flagged={flagged} onReveal={revealRow} />
    </div>
  );
};
