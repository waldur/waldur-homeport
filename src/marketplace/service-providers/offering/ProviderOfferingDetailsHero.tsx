import { FunctionComponent } from 'react';
import { Col, Form, Row, Stack } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { Image } from '@waldur/core/Image';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SymbolsGroup } from '@waldur/customer/dashboard/SymbolsGroup';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';
import { getAllOfferingPermissions } from '@waldur/marketplace/common/api';
import { OfferingItemActions } from '@waldur/marketplace/offerings/actions/OfferingItemActions';
import { Category, Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { Field } from '@waldur/resource/summary';

import { ProviderOfferingMetadataLink } from './ProviderOfferingMetadataLink';
import { ProviderOfferingQuickActions } from './ProviderOfferingQuickActions';

interface OwnProps {
  offering: Offering;
  category: Category;
}

const getStateBgClass = (state: Offering['state']) => {
  switch (state) {
    case 'Active':
      return 'bg-success';
    case 'Archived':
      return 'bg-info text-white';
    case 'Draft':
      return 'bg-secondary';
    case 'Paused':
      return 'bg-warning';

    default:
      return 'bg-secondary';
  }
};

export const ProviderOfferingDetailsHero: FunctionComponent<OwnProps> = (
  props,
) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  const {
    loading,
    error,
    value: offeringPermissions,
  } = useAsync(
    () =>
      getAllOfferingPermissions({
        params: {
          offering_uuid: props.offering.uuid,
        },
      }),
    [props.offering],
  );

  const offeringInfoItems = [
    { t: translate('Resources'), v: '223' },
    { t: translate('Clients'), v: '30' },
    { t: translate('Support Tickets'), v: '4349' },
  ];

  return (
    <>
      <PublicDashboardHero
        logo={props.category.icon}
        logoAlt={props.category.title}
        logoTopLabel={props.offering.state}
        logoBottomLabel={translate('Offering')}
        logoTopClass={getStateBgClass(props.offering.state)}
        logoBottomClass="bg-secondary"
        className="mb-6"
        actions={<OfferingItemActions offering={props.offering} dotted />}
        title={
          <>
            <div
              id="offering-selector-wrapper"
              className="offering-selector-wrapper d-flex align-items-center"
            >
              <div className="offering-selector-toggle btn btn-flush d-flex align-items-center mb-1">
                <h3 className="text-decoration-underline mb-0 me-2">
                  {props.offering.name}
                </h3>
                <i className="fa fa-caret-down fs-4 text-dark"></i>
              </div>
            </div>
            <i>
              {`${props.offering.customer_name} / ${props.offering.category_title}`}
            </i>
          </>
        }
        quickActions={<ProviderOfferingQuickActions />}
        quickFooter={
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 w-100">
            {offeringInfoItems.map((item) => (
              <div key={item.t} className="text-center">
                <h1 className="mb-0">{item.v}</h1>
                <span>{item.t}</span>
              </div>
            ))}
            <div className="text-center">
              <span
                className={
                  'dashboard-small-label ' +
                  getStateBgClass(props.offering.state)
                }
              >
                {props.offering.state}
              </span>
              <span>{translate('State')}</span>
            </div>
          </div>
        }
      >
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <>{translate('Unable to load offering manager')}</>
        ) : (
          offeringPermissions &&
          offeringPermissions.length > 0 && (
            <Form.Group as={Row} className="mb-1">
              <Form.Label column xs="auto">
                {translate('Offering manager:')}
              </Form.Label>
              <Col>
                <SymbolsGroup
                  items={offeringPermissions}
                  max={6}
                  nameKey="user_full_name"
                  emailKey="user_email"
                />
              </Col>
            </Form.Group>
          )
        )}
        <Field
          label={translate('Category:')}
          value={props.category.title}
          spaceless
        />
        <Field
          label={translate('Access:')}
          value="Public | Restricted (link to org groups)"
          spaceless
        />
        <div className="d-flex justify-content-between align-items-end mt-6">
          <div>
            {showExperimentalUiComponents && (
              <Stack direction="horizontal" gap={2}>
                {[1, 2, 3].map((i) => (
                  <Image key={i} src={props.category.icon} size={40} />
                ))}
              </Stack>
            )}
          </div>
          <ProviderOfferingMetadataLink />
        </div>
      </PublicDashboardHero>
    </>
  );
};
