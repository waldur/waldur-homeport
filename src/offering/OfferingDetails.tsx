import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import * as React from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import { Layout } from '@waldur/navigation/Layout';
import { useTitle } from '@waldur/navigation/title';
import { ProjectSidebar } from '@waldur/project/ProjectSidebar';
import store from '@waldur/store/store';
import {
  setCurrentCustomer,
  setCurrentProject,
} from '@waldur/workspace/actions';

import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

import {
  getProject,
  getOffering,
  getCustomer,
  getOfferingTemplate,
} from './api';
import { OfferingActions } from './OfferingActions';
import { OfferingSummary } from './OfferingSummary';
import { Offering } from './types';

const getBreadcrumbs = (offering: Offering): BreadcrumbItem[] => {
  const items = [
    {
      label: translate('Project workspace'),
      state: 'project.details',
      params: {
        uuid: offering.project_uuid,
      },
    },
    {
      label: translate('Resources'),
    },
  ];
  if (offering.marketplace_category_name) {
    const params = {
      category_uuid: offering.marketplace_category_uuid,
      uuid: offering.project_uuid,
    };
    items.push({
      label: offering.marketplace_category_name,
      state: 'marketplace-project-resources',
      params,
    });
  }
  return items;
};

const loadOffering = async (offeringUuid) => {
  const offering = await getOffering(offeringUuid);
  const template = await getOfferingTemplate(offering.template_uuid);
  const offeringConfig = template.config;
  const project = await getProject(offering.project_uuid);
  const customer = await getCustomer(project.customer_uuid);
  store.dispatch(setCurrentCustomer(customer));
  store.dispatch(setCurrentProject(project));
  ngInjector.get('WorkspaceService').setWorkspace({
    customer,
    project,
    hasCustomer: true,
    workspace: WOKSPACE_NAMES.project,
  });
  return {
    offering,
    offeringConfig,
  };
};

export const OfferingDetails = () => {
  const {
    params: { uuid: offeringUuid },
  } = useCurrentStateAndParams();

  const [{ loading, error, value }, reInitResource] = useAsyncFn(
    () => loadOffering(offeringUuid),
    [offeringUuid],
  );

  useTitle(value ? value.offering.name : translate('Request details'));

  useBreadcrumbsFn(() => (value ? getBreadcrumbs(value.offering) : []), [
    value,
  ]);

  const router = useRouter();

  React.useEffect(() => {
    if (!offeringUuid) {
      router.stateService.go('errorPage.notFound');
    } else {
      reInitResource();
    }
  }, [offeringUuid, router.stateService, reInitResource]);

  React.useEffect(() => {
    if ((error as any)?.status === 404) {
      router.stateService.go('errorPage.notFound');
    }
  }, [error, router.stateService]);

  return (
    <Layout
      sidebar={<ProjectSidebar />}
      pageClass="gray-bg"
      actions={
        value?.offering ? (
          <OfferingActions
            offering={value.offering}
            reInitResource={reInitResource}
          />
        ) : null
      }
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <>{translate('Unable to load data.')}</>
      ) : value ? (
        <OfferingSummary
          offering={value.offering}
          summary={value.offeringConfig.summary}
        />
      ) : null}
    </Layout>
  );
};
