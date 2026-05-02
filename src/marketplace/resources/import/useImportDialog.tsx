import { useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { change, getFormValues } from 'redux-form';
import {
  ImportableResource,
  marketplaceProviderOfferingsImportResource,
} from 'waldur-js-client';
import { Project } from 'waldur-js-client';

import { translate } from '@/i18n';
import { Offering, Plan } from '@/marketplace/types';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { createEntity } from '@/table/actions';
import { Customer } from '@/workspace/types';

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
  const dispatch = useDispatch();

  const { showErrorResponse, showSuccess } = useNotify();

  const { closeDialog } = useModal();

  const formValues = useSelector((state) =>
    getFormValues(IMPORT_RESOURCE_FORM_ID)(state),
  ) as FormData;

  const submitEnabled = useMemo(
    () =>
      formValues?.resources?.length > 0 &&
      (!offering?.billable ||
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

  const selectOffering = useCallback((value: Offering) => {
    setOffering(value);
    dispatch(change(IMPORT_RESOURCE_FORM_ID, 'resources', []));
  }, []);

  const assignPlan = (resource: ImportableResource, plan: Plan) =>
    setPlans({ ...plans, [resource.backend_id]: plan });

  const handleSubmit = useCallback(
    async (_formValues: FormData) => {
      try {
        for (const resource of _formValues.resources) {
          const marketplaceResource = (
            await marketplaceProviderOfferingsImportResource({
              path: { uuid: offering.uuid },
              body: {
                backend_id: resource.backend_id,
                project: _formValues.project.uuid,
                plan:
                  plans[resource.backend_id] && plans[resource.backend_id].uuid,
              },
            })
          ).data;
          dispatch(
            createEntity(
              'ProjectResourcesList',
              marketplaceResource.uuid,
              marketplaceResource,
            ),
          );
        }
        showSuccess(translate('All resources have been imported.'));
      } catch (e) {
        showErrorResponse(e, translate('Resources import has failed.'));
        return;
      }
      closeDialog();
    },
    [offering, plans],
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
