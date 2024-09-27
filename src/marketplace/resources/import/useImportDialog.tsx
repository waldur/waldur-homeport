import { useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { change, getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { importResource } from '@waldur/marketplace/common/api';
import { ImportableResource, Offering, Plan } from '@waldur/marketplace/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { createEntity } from '@waldur/table/actions';
import { Customer, Project } from '@waldur/workspace/types';

export const IMPORT_RESOURCE_FORM_ID = 'ResourceImportDialog';

interface FormData {
  organization: Customer;
  project: Project;
  resources: ImportableResource[];
}

export const useImportDialog = () => {
  const [step, setStep] = useState(1); // 3 steps
  const [offering, setOffering] = useState<Offering>();
  const [plans, setPlans] = useState<Record<string, Plan>>({});

  const formValues = useSelector((state) =>
    getFormValues(IMPORT_RESOURCE_FORM_ID)(state),
  ) as FormData;

  const submitEnabled = useMemo(
    () =>
      formValues?.resources?.length > 0 &&
      (!offering.billable ||
        formValues?.resources.every(
          (resource) => plans[resource.backend_id] !== undefined,
        )),
    [formValues, plans, offering],
  );

  const nextEnabled =
    step === 1
      ? formValues?.organization && formValues?.project
      : step === 2
        ? offering
        : false;

  const selectOffering = (value: Offering) => {
    setOffering(value);
    change(IMPORT_RESOURCE_FORM_ID, 'resources', []);
  };
  const assignPlan = (resource: ImportableResource, plan: Plan) =>
    setPlans({ ...plans, [resource.backend_id]: plan });

  const dispatch = useDispatch();

  const handleSubmit = useCallback(
    async (_formValues: FormData) => {
      try {
        for (const resource of _formValues.resources) {
          const payload = {
            offering_uuid: offering.uuid,
            backend_id: resource.backend_id,
            project: _formValues.project.uuid,
            plan: plans[resource.backend_id] && plans[resource.backend_id].uuid,
          };
          const marketplaceResource = await importResource(payload);
          dispatch(
            createEntity(
              'ProjectResourcesList',
              marketplaceResource.uuid,
              marketplaceResource,
            ),
          );
        }
        dispatch(showSuccess(translate('All resources have been imported.')));
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Resources import has failed.')),
        );
        return;
      }
      dispatch(closeModalDialog());
    },
    [dispatch, offering, plans],
  );

  return {
    step,
    setStep,
    offering,
    organization: formValues?.organization,
    project: formValues?.project,
    selectOffering,
    plans,
    assignPlan,
    nextEnabled,
    submitEnabled,
    handleSubmit,
  };
};
