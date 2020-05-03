import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import * as React from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { Layout } from '@waldur/navigation/Layout';
import { ProjectSidebar } from '@waldur/project/ProjectSidebar';

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

const refreshBreadcrumbs = (offering: Offering) => {
  const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
  BreadcrumbsService.items = [
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
    BreadcrumbsService.items.push({
      label: offering.marketplace_category_name,
      state: 'marketplace-project-resources',
      params: {
        category_uuid: offering.marketplace_category_uuid,
        uuid: offering.project_uuid,
      },
    });
  }
  BreadcrumbsService.activeItem = offering.name;
};

const loadOffering = async offeringUuid => {
  const offering = await getOffering(offeringUuid);
  const template = await getOfferingTemplate(offering.template_uuid);
  const offeringConfig = template.config;
  const project = await getProject(offering.project_uuid);
  const customer = await getCustomer(project.customer_uuid);
  ngInjector.get('currentStateService').setCustomer(customer);
  ngInjector.get('currentStateService').setProject(project);
  ngInjector.get('WorkspaceService').setWorkspace({
    customer,
    project,
    hasCustomer: true,
    workspace: WOKSPACE_NAMES.project,
  });
  refreshBreadcrumbs(offering);
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
      pageTitle={translate('Request details')}
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
