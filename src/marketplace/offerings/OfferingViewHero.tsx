import { QuestionIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, useMemo } from 'react';
import { Nav, Tab, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { ANNOUNCEMENT_ICON } from '@waldur/administration/utils';
import { ENV } from '@waldur/core/config';
import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';
import { ParentLink } from '@waldur/marketplace/resources/details/ParentResourceLink';
import { useExtraAnnouncementBar } from '@waldur/navigation/context';
import { AnnouncementBar } from '@waldur/navigation/header/announcements/AnnouncementBar';
import { useTitle } from '@waldur/navigation/title';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import {
  INSTANCE_TYPE,
  TENANT_TYPE,
  VOLUME_TYPE,
} from '@waldur/openstack/constants';
import {
  isOwnerOrStaff,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

import { RefreshButton } from '../common/RefreshButton';
import { getLabel } from '../common/registry';
import { Offering } from '../types';

import { OfferingStateActions } from './actions/OfferingStateActions';
import { DeployButton } from './DeployButton';
import { OfferingAccessButton } from './OfferingAccessButton';
import { OfferingExtraActionsButton } from './OfferingExtraActionsButton';
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

  useExtraAnnouncementBar(
    offering?.state === 'Unavailable' ? (
      <AnnouncementBar
        label={translate('This offering is temporarily unavailable.')}
        description={
          [TENANT_TYPE, VOLUME_TYPE, INSTANCE_TYPE].includes(offering.type)
            ? translate(
                'Operations on its resources (tenants, instances and volumes) are currently blocked.',
              )
            : translate('Operations on its resources are currently blocked.')
        }
        icon={ANNOUNCEMENT_ICON.warning.icon}
        variant={ANNOUNCEMENT_ICON.warning.variant}
        colored
      />
    ) : null,
    [offering],
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
                    data-testid="offering-tab-public"
                  >
                    {translate('Public')}
                    <QuestionIcon size={18} className="ms-1" weight="bold" />
                  </Nav.Link>
                </Tip>
              </Nav.Item>
            ) : (
              <Nav.Item>
                <Nav.Link
                  eventKey="public-offering.marketplace-public-offering"
                  className="text-center min-w-60px"
                  data-testid="offering-tab-public"
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
                data-testid="offering-tab-manage"
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
                data-testid="offering-tab-edit"
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
        backgroundImage={
          ENV.plugins?.WALDUR_CORE?.SHOW_OFFERING_COVER_IMAGE
            ? offering.image
            : undefined
        }
        logo={offering.thumbnail}
        logoSize={48}
        logoAlt={offering.name}
        logoTooltip={offering.category_title}
        logoCircle
        title={
          <div className="d-flex flex-column">
            <div className="d-flex flex-wrap align-items-center gap-2">
              <h3 className="mb-0 lh-1">{offering.name}</h3>
              <CopyToClipboardButton
                value={offering.name}
                className="text-hover-primary cursor-pointer"
                size={20}
              />

              <OfferingStateField offering={offering} hasBullet />
            </div>
            <p className="text-muted fs-7 mb-0">
              {translate('By {organization}', {
                organization: offering.customer_name,
              })}
              {offering.parent_name && offering.parent_uuid && (
                <>
                  <span className="mx-2">•</span>
                  <ParentLink
                    parent_name={offering.parent_name}
                    state="public-offering.marketplace-public-offering"
                    params={{ uuid: offering.parent_uuid }}
                  />
                </>
              )}
            </p>
            <Table className="mb-0 px-0 h-auto fs-7 w-auto mt-1">
              <tbody>
                {!props.isPublic && (
                  <tr>
                    <th className="fw-bold w-150px p-0 pe-3">
                      {translate('Shared/Billing enabled')}:
                    </th>
                    <td className="text-muted p-0">
                      {(offering.shared ? translate('Yes') : translate('No')) +
                        '/' +
                        (offering.billable
                          ? translate('Yes')
                          : translate('No'))}
                    </td>
                  </tr>
                )}
                <tr>
                  <th className="fw-bold w-100px p-0 pe-3">
                    {translate('Type')}:
                  </th>
                  <td className="text-muted p-0">{getLabel(offering.type)}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        }
        actions={
          <>
            {props.isPublic && (
              <DeployButton offering={offering} disabled={!canDeploy} />
            )}
            <OfferingAccessButton offering={offering} />
            {isEditPage && (
              <OfferingStateActions
                offering={offering}
                refreshOffering={props.refetch}
                className="order-2 order-sm-1 flex-sm-column-auto flex-root"
              />
            )}
            {!props.isPublic && (
              <div className="order-2 order-sm-2">
                <OfferingExtraActionsButton offering={offering} />
              </div>
            )}
            <RefreshButton
              refetch={props.refetch}
              isLoading={props.isRefetching}
              className="order-3 flex-sm-column-auto flex-root"
            />
          </>
        }
      />
    </div>
  );
};
