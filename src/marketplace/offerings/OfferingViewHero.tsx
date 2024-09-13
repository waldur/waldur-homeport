import { Question, RocketLaunch } from '@phosphor-icons/react';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, useMemo } from 'react';
import { Nav, Tab, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { Link } from '@waldur/core/Link';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { PublicDashboardHero2 } from '@waldur/dashboard/hero/PublicDashboardHero2';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import {
  isOwnerOrStaff,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

import { RefreshButton } from '../common/RefreshButton';
import { getLabel } from '../common/registry';
import { Offering } from '../types';

import { OfferingStateActions } from './actions/OfferingStateActions';
import { PreviewButton } from './list/PreviewButton';
import { OfferingStateField } from './OfferingStateField';

interface OfferingViewHeroProps {
  offering: Offering;
  isPublic?: boolean;
  refetch?(): void;
  isRefetching?: boolean;
  isLoading?: boolean;
  error?: any;
}

const serviceManagerOrOwnerOrStaffSelector = createSelector(
  isOwnerOrStaff,
  isServiceManagerSelector,
  (ownerOrStaff, serviceManager) => ownerOrStaff || serviceManager,
);

export const OfferingViewHero: FC<OfferingViewHeroProps> = (props) => {
  const router = useRouter();
  const { state } = useCurrentStateAndParams();

  const offering = props.offering;

  useTitle(offering ? offering.name : translate('Marketplace offering'));

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

  const canDeploy = useMemo(() => offering?.state === 'Active', [offering]);

  const isEditPage = [
    'admin-marketplace-offering-update',
    'marketplace-offering-update',
  ].includes(state.name);

  const canManageAndEditOfferings = useSelector(
    serviceManagerOrOwnerOrStaffSelector,
  );

  if (props.isLoading) {
    return <LoadingSpinner />;
  } else if (props.error) {
    return (
      <LoadingErred
        loadData={props.refetch}
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
                    className="d-flex align-items-center text-center min-w-60px opacity-50"
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
                  className="text-center min-w-60px"
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
                className="text-center min-w-60px"
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
                className="text-center min-w-60px"
              >
                {translate('Edit')}
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Tab.Container>
      )}
      <PublicDashboardHero2
        hideQuickSection
        cardBordered
        mobileBottomActions
        logo={offering.thumbnail}
        logoSize={100}
        logoAlt={offering.name}
        logoTooltip={offering.category_title}
        title={
          <>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <h3 className="mb-0">{offering.name}</h3>
              <CopyToClipboardButton
                value={offering.name}
                className="text-hover-primary cursor-pointer"
                size={20}
              />
              <OfferingStateField
                offering={offering}
                mode="outline"
                hasBullet
              />
            </div>
            <p className="text-muted mb-0">
              {translate('By {organization}', {
                organization: offering.customer_name,
              })}
            </p>
          </>
        }
        actions={
          <>
            {props.isPublic && (
              <Tip
                id="tip-deploy"
                label={
                  offering.state === 'Paused' ? offering.paused_reason : null
                }
                className="order-2 order-sm-1 flex-sm-column-auto flex-root"
              >
                <Link
                  state={canDeploy ? 'marketplace-offering-public' : ''}
                  params={{ offering_uuid: offering.uuid }}
                  className={`btn btn-primary w-100 ${canDeploy ? '' : 'disabled'}`}
                >
                  <span className="svg-icon svg-icon-2">
                    <RocketLaunch weight="bold" />
                  </span>
                  {translate('Deploy')}
                </Link>
              </Tip>
            )}
            <PreviewButton offering={offering} />
            {isEditPage && (
              <OfferingStateActions
                offering={offering}
                refreshOffering={props.refetch}
                className="order-2 order-sm-1 flex-sm-column-auto flex-root"
              />
            )}
            <RefreshButton
              refetch={props.refetch}
              isLoading={props.isRefetching}
              className="order-3 flex-sm-column-auto flex-root"
            />
          </>
        }
      >
        <Table className="mb-0 px-0">
          <tr>
            <th className="fw-bold w-sm-175px">
              {translate('Shared/Billing enabled')}:
            </th>
            <td>
              {(offering.shared ? translate('Yes') : translate('No')) +
                '/' +
                (offering.billable ? translate('Yes') : translate('No'))}
            </td>
          </tr>
          <tr>
            <th className="fw-bold w-sm-175px">{translate('Type')}:</th>
            <td>{getLabel(offering.type)}</td>
          </tr>
        </Table>
      </PublicDashboardHero2>
    </div>
  );
};
