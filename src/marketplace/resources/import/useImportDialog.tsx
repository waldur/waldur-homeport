import * as React from 'react';
import { useDispatch } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';
import useAsyncFn from 'react-use/lib/useAsyncFn';

import { translate } from '@waldur/i18n';
import {
  getAllOfferings,
  getImportableResources,
  importResource,
} from '@waldur/marketplace/common/api';
import { Offering, Plan, ImportableResource } from '@waldur/marketplace/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { showSuccess, showError } from '@waldur/store/coreSaga';
import { createEntity } from '@waldur/table/actions';

import { ImportDialogProps } from './types';

const getOfferingsForImport = (resolve) =>
  getAllOfferings({ params: { ...resolve, importable: true } });

const toggleElement = (element, list) =>
  list.includes(element)
    ? list.filter((item) => item !== element)
    : [...list, element];

export const useImportDialog = (props: ImportDialogProps) => {
  const [offering, setOffering] = React.useState<Offering>();
  const [resources, setResources] = React.useState<ImportableResource[]>([]);
  const [plans, setPlans] = React.useState<Record<string, Plan>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const submitEnabled = React.useMemo(
    () =>
      resources.length > 0 &&
      (!offering.billable ||
        resources.every(
          (resource) => plans[resource.backend_id] !== undefined,
        )),
    [resources, plans, offering],
  );

  const selectOffering = (value: Offering) => {
    setOffering(value);
    setResources([]);
  };
  const assignPlan = (resource: ImportableResource, plan: Plan) =>
    setPlans({ ...plans, [resource.backend_id]: plan });
  const toggleResource = (resource: ImportableResource) =>
    setResources(toggleElement(resource, resources));

  const offeringsProps = useAsync<Offering[]>(
    () => getOfferingsForImport(props.resolve),
    [props.resolve],
  );

  const [resourceProps, resourceCallback] = useAsyncFn<ImportableResource[]>(
    () => getImportableResources(offering.uuid),
    [offering],
  );

  React.useEffect(() => {
    if (offering) {
      resourceCallback();
    }
  }, [resourceCallback, offering]);

  const dispatch = useDispatch();

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      for (const resource of resources) {
        const payload = {
          offering_uuid: offering.uuid,
          backend_id: resource.backend_id,
          project: props.resolve.project_uuid,
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
    } catch {
      setSubmitting(false);
      dispatch(showError(translate('Resources import has failed.')));
      return;
    }
    dispatch(closeModalDialog());
  };

  return {
    offering,
    selectOffering,
    offeringsProps,
    resources,
    resourceProps,
    toggleResource,
    plans,
    assignPlan,
    submitEnabled,
    handleSubmit,
    submitting,
  };
};
