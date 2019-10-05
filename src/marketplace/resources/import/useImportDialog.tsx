import * as React from 'react';
import { useDispatch } from 'react-redux';

import { useQuery } from '@waldur/core/useQuery';
import { getAllOfferings, getImportableResources, importResource } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';

import { ImportDialogProps } from './types';

const loadOfferingsMethod = resolve => getAllOfferings({params: resolve});
const importResourcesMethod = params => Promise.all(params.map(importResource));

const toggleElement = (element, list) =>
  list.includes(element) ? list.filter(item => item !== element) : [...list, element];

export const useImportDialog = (props: ImportDialogProps) => {
  const [offering, setOffering] = React.useState();
  const [resources, setResources] = React.useState([]);
  const [plans, setPlans] = React.useState({});

  const assignPlan = (resource, plan) => setPlans({...plans, [resource.backend_id]: plan});
  const toggleResource = resource => setResources(toggleElement(resource, resources));

  const {state: offeringsProps, call: loadOfferings} = useQuery(loadOfferingsMethod, props.resolve);
  const {state: resourceProps, call: loadResources} = useQuery(offering && getImportableResources, offering && offering.uuid);

  const payload = React.useMemo(() => resources.map(resource => ({
    offering_uuid: offering.uuid,
    backend_id: resource.backend_id,
    project: props.resolve.project_uuid,
    plan: plans[resource.backend_id] && plans[resource.backend_id].uuid,
  })), [resources, plans]);
  const {state: submitProps, call: doSubmit} = useQuery(importResourcesMethod, payload);
  const dispatch = useDispatch();

  const handleSubmit = () => {
    doSubmit();
    dispatch(closeModalDialog());
  };

  React.useEffect(loadOfferings, []);
  React.useEffect(loadResources, [offering]);

  return {
    offering,
    setOffering,
    resources,
    toggleResource,
    plans,
    assignPlan,
    offeringsProps,
    resourceProps,
    handleSubmit,
    submitProps,
  };
};
