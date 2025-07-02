import { QuestionIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, useMemo } from 'react';
import { Nav, Tab, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
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
import { DeployButton } from './DeployButton';
import { PreviewButton } from './list/PreviewButton';
import { OfferingAccessButton } from './OfferingAccessButton';
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
    <div className="container-fluid my-5">
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
                    <QuestionIcon size={18} className="ms-1" />
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
      <PublicDashboardHero
        hideQuickSection
        cardBordered
        mobileBottomActions
        logo={offering.thumbnail}
        logoSize={100}
        logoAlt={offering.name}
        logoTooltip={offering.category_title}
        logoCircle
        title={
          <>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
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
            <p className="text-muted fs-7 mb-0">
              {translate('By {organization}', {
                organization: offering.customer_name,
              })}
            </p>
          </>
        }
        actions={
          <>
            {props.isPublic && (
              <DeployButton offering={offering} disabled={!canDeploy} />
            )}
            <OfferingAccessButton offering={offering} />
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
        <Table className="mb-0 px-0 h-auto fs-7 w-auto">
          {!props.isPublic && (
            <tr>
              <th className="fw-bold w-sm-175px">
                {translate('Shared/Billing enabled')}:
              </th>
              <td className="text-muted">
                {(offering.shared ? translate('Yes') : translate('No')) +
                  '/' +
                  (offering.billable ? translate('Yes') : translate('No'))}
              </td>
            </tr>
          )}
          <tr>
            <th className="fw-bold w-sm-175px">{translate('Type')}:</th>
            <td className="text-muted">{getLabel(offering.type)}</td>
          </tr>
        </Table>
      </PublicDashboardHero>
    </div>
  );
};
