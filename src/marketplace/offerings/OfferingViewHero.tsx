import { ArrowsClockwise, Question } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC } from 'react';
import { Button, Nav, Tab } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { PublicDashboardHero2 } from '@waldur/dashboard/hero/PublicDashboardHero2';
import { translate } from '@waldur/i18n';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { Field } from '@waldur/resource/summary';
import {
  isOwnerOrStaff,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

import { getProviderOffering, getPublicOffering } from '../common/api';
import { getLabel } from '../common/registry';

import { OfferingStateActions } from './actions/OfferingStateActions';
import { PreviewButton } from './list/PreviewButton';
import { OfferingStateField } from './OfferingStateField';

interface OfferingViewHeroProps {
  offeringUuid: string;
  isPublic?: boolean;
  refetch?(): void;
  isRefetching?: boolean;
}

const serviceManagerOrOwnerOrStaffSelector = createSelector(
  isOwnerOrStaff,
  isServiceManagerSelector,
  (ownerOrStaff, serviceManager) => ownerOrStaff || serviceManager,
);

export const OfferingViewHero: FC<OfferingViewHeroProps> = (props) => {
  const router = useRouter();
  const { state } = useCurrentStateAndParams();

  const {
    data: offering,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['OfferingOfHero', props.offeringUuid, props.isPublic],
    () =>
      props.isPublic
        ? getPublicOffering(props.offeringUuid)
        : getProviderOffering(props.offeringUuid),
    { refetchOnWindowFocus: false, staleTime: 3 * 60 * 1000 },
  );

  const goTo = (stateName) =>
    router.stateService.go(
      stateName,
      stateName === 'public-offering.marketplace-public-offering'
        ? { uuid: offering.uuid }
        : {
            offering_uuid: offering.uuid,
            uuid: offering.customer_uuid,
          },
    );

  const refetchData = () => {
    refetch();
    props.refetch();
  };

  const isEditPage = [
    'admin-marketplace-offering-update',
    'marketplace-offering-update',
  ].includes(state.name);

  const canManageAndEditOfferings = useSelector(
    serviceManagerOrOwnerOrStaffSelector,
  );

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return (
      <LoadingErred
        loadData={refetch}
        message={translate('Unable to load offering details.')}
      />
    );
  }

  return (
    <div className="container-fluid mb-8 mt-6">
      {canManageAndEditOfferings && (
        <Tab.Container defaultActiveKey={state.name} onSelect={goTo}>
          <Nav variant="tabs" className="nav-line-tabs mb-4">
            {offering.state === 'Draft' ? (
              <Nav.Item>
                <Tip
                  id="tip-public-offering-disabled"
                  label={translate(
                    'The public view is currently inactive as this offering is in draft status.',
                  )}
                >
                  <Nav.Link
                    disabled
                    className="d-flex align-items-center text-center w-60px opacity-50"
                  >
                    {translate('Public')}
                    <Question size={18} className="ms-1" />
                  </Nav.Link>
                </Tip>
              </Nav.Item>
            ) : (
              <Nav.Item>
                <Nav.Link
                  eventKey="public-offering.marketplace-public-offering"
                  className="text-center w-60px"
                >
                  {translate('Public')}
                </Nav.Link>
              </Nav.Item>
            )}
            <Nav.Item>
              <Nav.Link
                eventKey={
                  isDescendantOf('admin', state)
                    ? 'admin-marketplace-offering-details'
                    : 'marketplace-offering-details'
                }
                className="text-center w-60px"
              >
                {translate('Manage')}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey={
                  isDescendantOf('admin', state)
                    ? 'admin-marketplace-offering-update'
                    : 'marketplace-offering-update'
                }
                className="text-center w-60px"
              >
                {translate('Edit')}
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Tab.Container>
      )}
      <PublicDashboardHero2
        hideQuickSection
        logo={offering.thumbnail}
        logoAlt={offering.name}
        logoTooltip={offering.category_title}
        title={
          <>
            <div className="d-flex flex-wrap gap-2">
              <h3>{offering.name}</h3>
              <CopyToClipboardButton
                value={offering.name}
                className="text-hover-primary cursor-pointer"
                size={20}
              />
              <OfferingStateField offering={offering} />
            </div>
            <p className="text-muted mb-0">{offering.customer_name}</p>
          </>
        }
        actions={
          <>
            <PreviewButton offering={offering} />
            {isEditPage && (
              <OfferingStateActions
                offering={offering}
                refreshOffering={props.refetch}
              />
            )}
            <Button
              variant="secondary"
              size="sm"
              className="btn-icon"
              onClick={refetchData}
            >
              <ArrowsClockwise
                size={18}
                data-cy="loading-spinner"
                className={props.isRefetching ? 'fa-spin' : undefined}
              />
            </Button>
          </>
        }
      >
        <Field
          label={translate('Shared/Billing enabled')}
          value={
            (offering.shared ? translate('Yes') : translate('No')) +
            '/' +
            (offering.billable ? translate('Yes') : translate('No'))
          }
        />
        <Field label={translate('Type')} value={getLabel(offering.type)} />
      </PublicDashboardHero2>
    </div>
  );
};
