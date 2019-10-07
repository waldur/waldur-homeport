import * as React from 'react';
import { useDispatch } from 'react-redux';

import { useQuery } from '@waldur/core/useQuery';
import { translate } from '@waldur/i18n';
import { getAllOfferings, getImportableResources, importResource } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showSuccess, showError } from '@waldur/store/coreSaga';
import { createEntity } from '@waldur/table-react/actions';

import { ImportDialogProps } from './types';

const loadOfferingsMethod = resolve => getAllOfferings({params: resolve});

const toggleElement = (element, list) =>
  list.includes(element) ? list.filter(item => item !== element) : [...list, element];

export const useImportDialog = (props: ImportDialogProps) => {
  const [offering, setOffering] = React.useState();
  const [resources, setResources] = React.useState([]);
  const [plans, setPlans] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  const assignPlan = (resource, plan) => setPlans({...plans, [resource.backend_id]: plan});
  const toggleResource = resource => setResources(toggleElement(resource, resources));

  const {state: offeringsProps, call: loadOfferings} = useQuery(loadOfferingsMethod, props.resolve);
  const {state: resourceProps, call: loadResources} = useQuery(offering && getImportableResources, offering && offering.uuid);

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
        dispatch(createEntity('ProjectResourcesList', marketplaceResource.uuid, marketplaceResource));
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
    setOffering,
    offeringsProps,
    resources,
    resourceProps,
    toggleResource,
    plans,
    assignPlan,
    handleSubmit,
    submitting,
  };
};
