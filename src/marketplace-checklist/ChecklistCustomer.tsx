import { useState, FunctionComponent } from 'react';
import { Table, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { useAsync, useAsyncFn } from 'react-use';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { ENV } from '@waldur/configs/default';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

import {
  getCategories,
  getChecklists,
  getCustomerChecklists,
  updateCustomerChecklists,
} from './api';
import { Category, Checklist } from './types';

const formatRolesList = (roles) =>
  roles.length === 0
    ? 'N/A'
    : roles.map((role) => translate(ENV.roles[role])).join(', ');

export const ChecklistCustomer: FunctionComponent = () => {
  useTitle(translate('Checklists'));
  const customer = useSelector(getCustomer);
  const [category, setCategory] = useState<Category>();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const dispatch = useDispatch();

  const categoriesState = useAsync<Category[]>(getCategories);
  const checklistsState = useAsync<Checklist[]>(async () => {
    if (category) {
      const checklists = await getChecklists(category.uuid);
      const customerChecklists = await getCustomerChecklists(customer.uuid);
      setEnabled(
        customerChecklists.data.reduce(
          (res, checklist) => ({ ...res, [checklist]: true }),
          {},
        ),
      );
      return checklists;
    } else {
      setEnabled({});
      return [];
    }
  }, [category]);

  const [submitState, submitCallback] = useAsyncFn(async () => {
    try {
      await updateCustomerChecklists(
        customer.uuid,
        Object.keys(enabled).filter((checklistId) => enabled[checklistId]),
      );
      dispatch(showSuccess(translate('Enabled checklists have been updated.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to update enabled checklists.')),
      );
    }
  }, [customer, enabled]);

  if (categoriesState.loading) {
    return <LoadingSpinner />;
  }

  if (categoriesState.error) {
    return <h3>{translate('Unable to load categories.')}</h3>;
  }

  if (!categoriesState.value?.length) {
    return <h3>{translate('There are no categories.')}</h3>;
  }

  return (
    <>
      <Select
        getOptionValue={(option) => option.uuid}
        getOptionLabel={(option) => option.name}
        value={category}
        onChange={(value: Category) => setCategory(value)}
        options={categoriesState.value}
      />

      {!category ? null : checklistsState.loading ? (
        <LoadingSpinner />
      ) : checklistsState.error ? (
        <h3>{translate('Unable to load checklists.')}</h3>
      ) : !checklistsState.value ? null : checklistsState.value &&
        !checklistsState.value.length ? (
        <h3>{translate('There are no checklists.')}</h3>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitCallback();
          }}
        >
          <Table
            responsive={true}
            bordered={true}
            striped={true}
            className="m-t-md"
          >
            <thead>
              <tr>
                <th>{translate('Category')}</th>
                <th className="col-sm-2">{translate('Enabled')}</th>
                <th className="col-sm-2">{translate('Organization roles')}</th>
                <th className="col-sm-2">{translate('Project roles')}</th>
              </tr>
            </thead>
            <tbody>
              {checklistsState.value.map((checklist) => (
                <tr key={checklist.uuid}>
                  <td>
                    <strong>{checklist.name}</strong>
                    {checklist.description && <p>{checklist.description}</p>}
                  </td>
                  <td>
                    <ToggleButtonGroup
                      value={
                        enabled[checklist.uuid] === true ? 'true' : 'false'
                      }
                      onChange={(value) =>
                        setEnabled({
                          ...enabled,
                          [checklist.uuid]: value === 'true' ? true : false,
                        })
                      }
                      type="radio"
                      name={`checklist-${checklist.uuid}`}
                      disabled={submitState.loading}
                    >
                      <ToggleButton value="true">
                        {translate('Yes')}
                      </ToggleButton>
                      <ToggleButton value="false">
                        {translate('No')}
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </td>
                  <td>{formatRolesList(checklist.customer_roles)}</td>
                  <td>{formatRolesList(checklist.project_roles)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <SubmitButton submitting={submitState.loading} block={false}>
            {translate('Save')}
          </SubmitButton>
        </form>
      )}
    </>
  );
};
