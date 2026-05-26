import { FormApi } from 'final-form';
import { useCallback, useMemo, useState } from 'react';
import {
  ImportableResource,
  marketplaceProviderOfferingsImportResource,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { Offering, Plan } from '@/marketplace/types';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Project, Customer } from '@/workspace/types';

export interface FormData {
  organization?: Customer;
  project?: Project;
  resources?: ImportableResource[];
}

export const useImportDialog = (
  form: FormApi<FormData>,
  formValues: Partial<FormData>,
) => {
  const [step, setStep] = useState(1); // 3 steps
  const [offering, setOffering] = useState<Offering>();
  const [plans, setPlans] = useState<Record<string, Plan>>({});

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
      ? Boolean(formValues?.organization && formValues?.project)
      : step === 2
        ? Boolean(offering)
        : false;

  const selectOffering = useCallback(
    (value: Offering) => {
      setOffering(value);
      form.change('resources', []);
    },
    [form],
  );

  const assignPlan = (resource: ImportableResource, plan: Plan) =>
    setPlans({ ...plans, [resource.backend_id]: plan });

  const importMutation = useManagedMutation<any, any, FormData>({
    mutationFn: async (_formValues) => {
      for (const resource of _formValues.resources || []) {
        await marketplaceProviderOfferingsImportResource({
          path: { uuid: offering.uuid },
          body: {
            backend_id: resource.backend_id,
            project: _formValues.project.uuid,
            plan: plans[resource.backend_id] && plans[resource.backend_id].uuid,
          },
        });
      }
    },
    successMessage: translate('All resources have been imported.'),
    errorMessage: translate('Resources import has failed.'),
    invalidateQueries: [{ queryKey: ['table', 'ProjectResourcesList'] }],
  });

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
    onSubmit: importMutation.mutateAsync,
  };
};
