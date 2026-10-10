import { QuestionIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useMemo } from 'react';
import { Table } from 'react-bootstrap';
import { Offering } from 'waldur-js-client';

import { TabNav } from 'waldur-ui';

import { ANNOUNCEMENT_ICON } from '@/administration/utils';
import { ENV } from '@/core/config';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { PublicDashboardHero } from '@/dashboard/hero/PublicDashboardHero';
import { translate } from '@/i18n';
import { ParentLink } from '@/marketplace/resources/details/ParentResourceLink';
import { useExtraAnnouncementBar } from '@/navigation/context';
import { AnnouncementBar } from '@/navigation/header/announcements/AnnouncementBar';
import { useTitle } from '@/navigation/title';
import { isDescendantOf } from '@/navigation/useTabs';
import { INSTANCE_TYPE, TENANT_TYPE, VOLUME_TYPE } from '@/openstack/constants';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { TableRefreshButton } from '@/table/TableRefreshButton';
import { useUser } from '@/workspace/hooks';

import { useOfferingAccessibility } from '../common/cards/useOfferingAccessibility';
import { getLabel } from '../common/registry';

import { RequestAccessButton } from './access/RequestAccessButton';
import { OfferingStateActions } from './actions/OfferingStateActions';
import { OfferingAccessButton } from './OfferingAccessButton';
import { OfferingExtraActionsButton } from './OfferingExtraActionsButton';
import { OfferingStateField } from './OfferingStateField';
import { OfferingSupportButton } from './OfferingSupportButton';

interface OfferingViewHeroProps {
  offering: Offering;
  isPublic?: boolean;
  refetch?(): void;
  isRefetching?: boolean;
  isLoading?: boolean;
  error?: any;
}

export const OfferingViewHero: FC<OfferingViewHeroProps> = (props) => {
  const { state } = useCurrentStateAndParams();
  const user = useUser();

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

  const isAdmin = isDescendantOf('admin', state);
  const manageState = isAdmin
    ? 'admin-marketplace-offering-details'
    : 'marketplace-offering-details';
  const editState = isAdmin
    ? 'admin-marketplace-offering-update'
    : 'marketplace-offering-update';

  const getParams = (stateName: string) =>
    stateName === 'public-offering.marketplace-public-offering'
      ? { uuid: offering.uuid }
      : {
          offering_uuid: offering.uuid,
          uuid: offering.customer_uuid,
        };

  const { isDisabled: isNotAccessible, disabledButtonTooltip } =
    useOfferingAccessibility(offering);

  const canDeploy = useMemo(
    () => offering?.state === 'Active' && !isNotAccessible,
    [offering, isNotAccessible],
  );

  const isEditPage = [
    'admin-marketplace-offering-update',
    'marketplace-offering-update',
  ].includes(state.name);

  const canManageAndEditOfferings =
    !!offering &&
    !!hasPermission(user, {
      permission: PermissionEnum.UPDATE_OFFERING,
      offeringId: offering.uuid,
      customerId: offering.customer_uuid,
    });

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
        <TabNav
          activeKey={state.name}
          listClassName="mb-4"
          items={[
            offering.state === 'Draft'
              ? {
                  key: 'public-offering.marketplace-public-offering',
                  title: (
                    <>
                      {translate('Public')}
                      <QuestionIcon size={18} className="ms-1" weight="bold" />
                    </>
                  ),
                  disabled: true,
                  tooltip: translate(
                    'The public view is currently inactive as this offering is in draft status.',
                  ),
                  className: 'text-center min-w-60px',
                  testId: 'offering-tab-public',
                }
              : {
                  key: 'public-offering.marketplace-public-offering',
                  title: translate('Public'),
                  link: (
                    <Link
                      state="public-offering.marketplace-public-offering"
                      params={getParams(
                        'public-offering.marketplace-public-offering',
                      )}
                    />
                  ),
                  className: 'text-center min-w-60px',
                  testId: 'offering-tab-public',
                },
            {
              key: manageState,
              title: translate('Manage'),
              link: (
                <Link
                  state={manageState}
                  params={getParams('marketplace-offering-details')}
                />
              ),
              className: 'text-center min-w-60px',
              testId: 'offering-tab-manage',
            },
            {
              key: editState,
              title: translate('Edit'),
              link: (
                <Link
                  state={editState}
                  params={getParams('marketplace-offering-update')}
                />
              ),
              className: 'text-center min-w-60px',
              testId: 'offering-tab-edit',
            },
          ]}
        />
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
            {/* Plugin type is an internal integration detail: it names the
                backend the offering is wired to, not anything a prospective
                customer can act on. Keep it to the provider/staff view. */}
            {!props.isPublic && (
              <Table className="mb-0 px-0 h-auto fs-7 w-auto mt-1">
                <tbody>
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
                  <tr>
                    <th className="fw-bold w-100px p-0 pe-3">
                      {translate('Type')}:
                    </th>
                    <td className="text-muted p-0">
                      {getLabel(offering.type)}
                    </td>
                  </tr>
                </tbody>
              </Table>
            )}
          </div>
        }
        actions={
          <>
            {props.isPublic && (
              <RequestAccessButton
                offering={offering}
                orderDisabledReason={
                  !canDeploy ? disabledButtonTooltip : undefined
                }
              />
            )}
            {props.isPublic && <OfferingSupportButton offering={offering} />}
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
                <OfferingExtraActionsButton
                  offering={offering}
                  refreshOffering={props.refetch}
                  showLifecycleActions={isEditPage}
                />
              </div>
            )}
            <div className="order-first align-self-center">
              <TableRefreshButton
                fetch={() => props.refetch?.()}
                loading={props.isRefetching}
              />
            </div>
          </>
        }
      />
    </div>
  );
};
