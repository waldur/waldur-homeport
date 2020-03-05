import * as React from 'react';
import { useDispatch } from 'react-redux';

import { useQuery } from '@waldur/core/useQuery';
import { translate } from '@waldur/i18n';
import {
  getAllOfferings,
  getImportableResources,
  importResource,
} from '@waldur/marketplace/common/api';
import { Offering, Plan, ImportableResource } from '@waldur/marketplace/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { showSuccess, showError } from '@waldur/store/coreSaga';
import { createEntity } from '@waldur/table-react/actions';

import { ImportDialogProps } from './types';

const getOfferingsForImport = resolve =>
  getAllOfferings({ params: { ...resolve, importable: true } });

const toggleElement = (element, list) =>
  list.includes(element)
    ? list.filter(item => item !== element)
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
        resources.every(resource => plans[resource.backend_id] !== undefined)),
    [resources, plans],
  );

  const selectOffering = (value: Offering) => {
    setOffering(value);
    setResources([]);
  };
  const assignPlan = (resource: ImportableResource, plan: Plan) =>
    setPlans({ ...plans, [resource.backend_id]: plan });
  const toggleResource = (resource: ImportableResource) =>
    setResources(toggleElement(resource, resources));

  const { state: offeringsProps, call: loadOfferings } = useQuery<Offering[]>(
    getOfferingsForImport,
    props.resolve,
  );
  const { state: resourceProps, call: loadResources } = useQuery<
    ImportableResource[]
  >(offering && getImportableResources, offering && offering.uuid);

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

  React.useEffect(loadOfferings, []);
  React.useEffect(loadResources, [offering]);

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
