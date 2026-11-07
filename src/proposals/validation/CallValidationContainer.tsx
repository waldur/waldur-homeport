import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { proposalProtectedCallsRetrieve } from 'waldur-js-client';

import { useBreadcrumbs } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { AccessDeniedPage } from '@/error/AccessDeniedPage';
import { InvalidRoutePage } from '@/error/InvalidRoutePage';
import { translate } from '@/i18n';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';
import { LayoutSlot } from '@/navigation/slots';
import { useTitle } from '@/navigation/title';
import { useUser } from '@/workspace/hooks';

import { CallTabs } from '../details/CallTabs';
import { CallUpdateHero } from '../update/CallUpdateHero';
import { canAccessCallManagement, useCallBreadcrumbItems } from '../utils';
import { CallValidationBody } from '../workflow-description/WorkflowValidationSection';

const PageHero = ({ call, refetch }) => (
  <div className={classNames(PAGE_CONTAINER_CLASSNAME, 'my-4')}>
    <CallTabs call={call} />
    <CallUpdateHero call={call} refetch={refetch} />
  </div>
);

const Body = ({ call, refetch }) => {
  useBreadcrumbs(useCallBreadcrumbItems(call));
  return (
    <>
      <LayoutSlot name="hero">
        <PageHero call={call} refetch={refetch} />
      </LayoutSlot>
      <CallValidationBody call={call} />
    </>
  );
};

/** The call's Validation page: whether its workflow works as intended. */
export const CallValidationContainer: FunctionComponent = () => {
  const {
    params: { call_uuid },
  } = useCurrentStateAndParams();
  const user = useUser();

  const {
    data: call,
    isLoading,
    error,
    refetch,
  } = useQuery({
    // The Manage page's: the hero and the tabs read the same call.
    queryKey: ['CallManageContainer', call_uuid],
    queryFn: () =>
      proposalProtectedCallsRetrieve({ path: { uuid: call_uuid } }).then(
        (r) => r.data,
      ),
    refetchOnWindowFocus: false,
  });

  useTitle(call ? call.name : translate('Validation'));

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3>{translate('Unable to load call details.')}</h3>
  ) : call ? (
    // The workflow's configuration is the call team's, staff's and
    // support's to read, the audience of the Manage page.
    canAccessCallManagement(user, call) ? (
      <Body refetch={refetch} call={call} />
    ) : (
      <AccessDeniedPage />
    )
  ) : (
    <InvalidRoutePage />
  );
};
