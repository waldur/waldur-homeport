import { PlusIcon, QuestionIcon, TrashIcon } from '@phosphor-icons/react';
import { Fragment, ReactNode, useCallback, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Field, useField } from 'react-final-form';

import { Tooltip } from 'waldur-ui';

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
import { ActionButton } from '@/table/ActionButton';
import { TablePagination } from '@/table/TablePagination';

import { RoleAndProjectSelectField } from './RoleAndProjectSelectField';

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

/** Duplicate (email + role) in form – only show error while the pair still appears more than once */
const duplicateInFormValidator = (
  value: string,
  allValues: any,
  fieldName: string,
) => {
  if (!value) return undefined;
  const list = allValues?._duplicateInFormEmails as
    Array<{ email: string; roleUuid: string }> | undefined;
  if (!Array.isArray(list)) return undefined;
  const rowIndex = getRowIndexFromFieldName(fieldName);
  if (rowIndex == null) return undefined;
  const roleUuid = getRoleUuidForRow(allValues, rowIndex);
  const wasFlagged = list.some(
    (p) => p.email === value && p.roleUuid === roleUuid,
  );
  if (!wasFlagged) return undefined;
  const rows = allValues?.rows ?? [];
  const count = rows.filter(
    (row: { email?: string; role_project?: { role?: { uuid?: string } } }) =>
      row?.email === value && row?.role_project?.role?.uuid === roleUuid,
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
  const list = allValues?._duplicateEmails as
    Array<{ email: string; roleUuid: string }> | undefined;
  if (!Array.isArray(list)) return undefined;
  const rowIndex = getRowIndexFromFieldName(fieldName);
  if (rowIndex == null) return undefined;
  const roleUuid = getRoleUuidForRow(allValues, rowIndex);
  const isDuplicate = list.some(
    (p) => p.email === value && p.roleUuid === roleUuid,
  );
  if (isDuplicate) {
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
  const list = allValues?._existingRoleBlocks as ExistingRoleHit[] | undefined;
  if (!Array.isArray(list)) return undefined;
  const rowIndex = getRowIndexFromFieldName(fieldName);
  if (rowIndex == null) return undefined;
  const roleUuid = getRoleUuidForRow(allValues, rowIndex);
  const hit = list.find((h) => h.email === value && h.roleUuid === roleUuid);
  if (!hit) return undefined;
  return {
    __existingRoleBlock: true,
    message: getExistingRoleMessage(hit),
  };
};

type FlaggedPair = { email?: string; roleUuid?: string };

const getFeedbackColSpan = () =>
  isFeatureVisible(InvitationsFeatures.conceal_civil_number) ? 3 : 4;

const findRowHit = <T extends FlaggedPair>(
  list: T[] | '' | undefined,
  email: string,
  roleUuid: string,
): T | undefined =>
  Array.isArray(list)
    ? list.find((item) => item.email === email && item.roleUuid === roleUuid)
    : undefined;

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
const RowFeedback = ({ name }: { name: string }) => {
  const useList = (listName: string) =>
    useField<FlaggedPair[]>(listName, { subscription: { value: true } }).input
      .value;
  const pending = useList('_duplicateEmails');
  const blocks = useList('_existingRoleBlocks') as ExistingRoleHit[] | '';
  const warnings = useList('_existingRoleWarnings') as ExistingRoleHit[] | '';
  const {
    input: { value: email },
  } = useField<string>(`${name}.email`, { subscription: { value: true } });
  const {
    input: { value: roleProject },
  } = useField(`${name}.role_project`, { subscription: { value: true } });
  const roleUuid = roleProject?.role?.uuid;
  if (!email || !roleUuid) return null;

  let message: ReactNode = null;
  if (findRowHit(pending, email, roleUuid)) {
    message = (
      <FieldError
        error={translate('This email already has a pending invitation.')}
      />
    );
  } else {
    const block = findRowHit(blocks, email, roleUuid);
    const warning = findRowHit(warnings, email, roleUuid);
    if (block) {
      message = <FieldError error={getExistingRoleMessage(block)} />;
    } else if (warning) {
      message = <FieldWarning error={getExistingRoleMessage(warning)} />;
    }
  }
  if (!message) return null;
  return (
    <tr className="fs-6">
      <td colSpan={getFeedbackColSpan()} className="border-0 pt-0 pb-2">
        {message}
      </td>
    </tr>
  );
};

/**
 * Continue writes its verdicts next to the rows, but the rows are paginated:
 * a verdict on another page would leave Continue looking like it did nothing.
 * Whenever a new set of verdicts arrives, show the page of the first flagged
 * row unless the current page already has one.
 */
const useShowFirstFlaggedRow = (
  rows: any[] | undefined,
  page: number,
  pageSize: number,
  setPage: (page: number) => void,
) => {
  const useList = (name: string) =>
    useField<FlaggedPair[]>(name, { subscription: { value: true } }).input
      .value;
  const inForm = useList('_duplicateInFormEmails');
  const pending = useList('_duplicateEmails');
  const blocks = useList('_existingRoleBlocks');
  const warnings = useList('_existingRoleWarnings');
  useEffect(() => {
    const pairs = [inForm, pending, blocks, warnings]
      .filter(Array.isArray)
      .flat();
    if (!pairs.length || !rows?.length) return;
    const flagged = rows
      .map((row, index) =>
        pairs.some(
          (pair) =>
            pair.email === row?.email &&
            pair.roleUuid === row?.role_project?.role?.uuid,
        )
          ? index
          : -1,
      )
      .filter((index) => index >= 0);
    if (!flagged.length) return;
    const start = (page - 1) * pageSize;
    if (flagged.some((index) => index >= start && index < start + pageSize)) {
      return;
    }
    setPage(Math.floor(flagged[0] / pageSize) + 1);
    // Keyed on the verdicts only: paging away from a flagged row, or editing
    // one, must not pull the page back.
  }, [inForm, pending, blocks, warnings]);
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

  useShowFirstFlaggedRow(fields.value, page, pageSize, setPage);

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

  const removeRow = (index) => {
    fields.remove(index);
    refreshPageOnRemove();
  };

  return (
    <div className="mb-3">
      <div id="emails-list-group">
        {fields.length > 0 && (
          <Form.Group>
            <table className="table align-middle px-0 gy-2 mb-0">
              <thead>
                <tr className="fs-6 fw-bold">
                  <td className="w-250px">{translate('Email')}</td>
                  {!isFeatureVisible(
                    InvitationsFeatures.conceal_civil_number,
                  ) && (
                    <td className="id-column">
                      {ENV.plugins.WALDUR_CORE.INVITATION_CIVIL_NUMBER_LABEL ||
                        translate('Civil number')}{' '}
                      <Tooltip
                        label={translate(
                          'Must start with a country prefix ie EE34501234215',
                        )}
                      >
                        <QuestionIcon weight="bold" />
                      </Tooltip>
                    </td>
                  )}
                  <td className="role-column">{translate('Role')}</td>
                  <td className="w-5px" />
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((user, i) => {
                  if (!user) return null;
                  return (
                    <Fragment key={user}>
                      <tr className="fs-6">
                        <td>
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
                        </td>
                        {isFeatureVisible(
                          InvitationsFeatures.conceal_civil_number,
                        ) ? null : (
                          <td>
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
                          </td>
                        )}
                        <td className="role-column">
                          <RoleAndProjectSelectField
                            name={`${user}.role_project`}
                            roles={roles}
                            customer={customer}
                            currentProject={project}
                          />
                        </td>
                        <td>
                          <ActionButton
                            variant="text-danger"
                            action={() => removeRow(i)}
                            disabled={fields.length === 1}
                            disabledReason={translate(
                              'At least one email is required',
                            )}
                            iconNode={<TrashIcon weight="bold" />}
                          />
                        </td>
                      </tr>
                      <RowFeedback name={user} />
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </Form.Group>
        )}
        <div>
          <ActionButton
            variant="text-primary"
            disabled={warn}
            disabledReason={translate(
              'Fill in empty email fields before adding more',
            )}
            action={addRow}
            title={
              fields.length > 0
                ? translate('Add another user')
                : translate('Add user')
            }
            iconNode={<PlusIcon weight="bold" />}
          />
          {warn && (
            <span className="text-danger ms-2">
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
      />
    </div>
  );
};
