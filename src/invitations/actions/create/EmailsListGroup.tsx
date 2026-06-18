import { PlusIcon, QuestionIcon, TrashIcon } from '@phosphor-icons/react';
import { Fragment, useCallback, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';

import { ENV } from '@/core/config';
import { Tip } from '@/core/Tooltip';
import { usePagination } from '@/core/usePagination';
import { composeValidators, email, required } from '@/core/validators';
import { isFeatureVisible } from '@/features/connect';
import { InvitationsFeatures } from '@/FeaturesEnums';
import { EmailField } from '@/form/EmailField';
import { FieldError } from '@/form/FieldError';
import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';
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
    | Array<{ email: string; roleUuid: string }>
    | undefined;
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

/** Pending invitation from API – set after check-duplicates response. Returns object so we can show message only for server duplicates. */
const duplicateInvitationValidator = (
  value: string,
  allValues: any,
  fieldName: string,
) => {
  if (!value) return undefined;
  const list = allValues?._duplicateEmails as
    | Array<{ email: string; roleUuid: string }>
    | undefined;
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
                        translate('Civil number')}
                      <Tip
                        label={translate(
                          'Must start with a country prefix ie EE34501234215',
                        )}
                        id="idTooltip"
                      >
                        {' '}
                        <QuestionIcon weight="bold" />
                      </Tip>
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
                              return duplicateInvitationValidator(
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
                      <Field
                        name={`${user}.email`}
                        subscription={{ error: true }}
                        render={({ meta }) => {
                          const err = meta.error;
                          if (
                            !err ||
                            typeof err !== 'object' ||
                            !(err as { __pendingInvitation?: boolean })
                              .__pendingInvitation
                          )
                            return null;
                          return (
                            <tr className="fs-6">
                              <td
                                colSpan={
                                  isFeatureVisible(
                                    InvitationsFeatures.conceal_civil_number,
                                  )
                                    ? 3
                                    : 4
                                }
                                className="border-0 pt-0 pb-2"
                              >
                                <FieldError
                                  error={(err as { message: string }).message}
                                />
                              </td>
                            </tr>
                          );
                        }}
                      />
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
