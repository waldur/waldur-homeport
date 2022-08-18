import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useEffect, FunctionComponent } from 'react';
import { useAsyncFn } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getIssue } from '@waldur/issues/api';
import {
  getResource,
  getOffering,
  getOrderItemList,
} from '@waldur/marketplace/common/api';
import { useTitle } from '@waldur/navigation/title';

import { SupportDetails } from './SupportDetails';

const loadData = async (resource_uuid: string) => {
  const resource = await getResource(resource_uuid);
  const offering = await getOffering(resource.offering_uuid);
  const orderItems = await getOrderItemList({
    type: 'Create',
    resource_uuid: resource.uuid,
  });
  const orderItem = orderItems.length === 1 ? orderItems[0] : null;
  const issue = orderItem?.issue?.uuid
    ? await getIssue(orderItem.issue.uuid)
    : undefined;
  return {
    resource,
    offering,
    issue,
  };
};

export const SupportDetailsContainer: FunctionComponent = () => {
  const {
    params: { resource_uuid },
  } = useCurrentStateAndParams();

  const [{ loading, error, value }, reInitResource] = useAsyncFn(
    () => loadData(resource_uuid),
    [resource_uuid],
  );

  useTitle(value ? value.resource.name : translate('Request details'));

  const router = useRouter();

  useEffect(() => {
    if (!resource_uuid) {
      router.stateService.go('errorPage.notFound');
    } else {
      reInitResource();
    }
  }, [resource_uuid, router.stateService, reInitResource]);

  useEffect(() => {
    if ((error as any)?.status === 404) {
      router.stateService.go('errorPage.notFound');
    }
  }, [error, router.stateService]);

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load data.')}</>
  ) : value ? (
    <SupportDetails
      resource={value.resource}
      reInitResource={reInitResource}
      summary={value.offering.full_description}
      issue={value.issue}
    />
  ) : null;
};
