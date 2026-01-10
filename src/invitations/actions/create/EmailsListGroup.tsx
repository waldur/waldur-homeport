import { PlusIcon, QuestionIcon, TrashIcon } from '@phosphor-icons/react';
import { Fragment, useCallback, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';

import { ENV } from '@waldur/core/config';
import { Tip } from '@waldur/core/Tooltip';
import { usePagination } from '@waldur/core/usePagination';
import { composeValidators, email, required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { InvitationsFeatures } from '@waldur/FeaturesEnums';
import { EmailField } from '@waldur/form/EmailField';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';
import { TablePagination } from '@waldur/table/TablePagination';

import { RoleAndProjectSelectField } from './RoleAndProjectSelectField';

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
                            placeholder={translate('Enter email address')}
                            required
                            component={EmailField as any}
                            validate={composeValidators(required, email)}
                          />
                        </td>
                        {isFeatureVisible(
                          InvitationsFeatures.conceal_civil_number,
                        ) ? null : (
                          <td>
                            <Field
                              name={`${user}.civil_number`}
                              placeholder={translate('e.g. EE123456789')}
                              component={InputField as any}
                              disabled={disabled}
                              validate={
                                isFeatureVisible(
                                  InvitationsFeatures.civil_number_required,
                                )
                                  ? required
                                  : undefined
                              }
                            />
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
                            iconNode={<TrashIcon weight="bold" />}
                          />
                        </td>
                      </tr>
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
