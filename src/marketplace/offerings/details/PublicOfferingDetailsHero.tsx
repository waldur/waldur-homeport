import { FunctionComponent } from 'react';
import { Col, Form, Row, Stack } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { Image } from '@waldur/core/Image';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SymbolsGroup } from '@waldur/customer/dashboard/SymbolsGroup';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';
import { getAllOfferingPermissions } from '@waldur/marketplace/common/api';
import { Category, Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { Field } from '@waldur/resource/summary';

import { OfferingItemActions } from '../actions/OfferingItemActions';

import { PublicOfferingMetadataLink } from './PublicOfferingMetadataLink';

interface OwnProps {
  offering: Offering;
  category: Category;
}

export const PublicOfferingDetailsHero: FunctionComponent<OwnProps> = (
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

  return (
    <>
      <PublicDashboardHero
        logo={props.category.icon}
        logoAlt={props.category.title}
        backgroundImage={props.offering.image}
        actions={<OfferingItemActions offering={props.offering} dotted />}
        title={
          <>
            <div
              id="resource-selector-wrapper"
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
        quickBody={
          <div className="bg-gray-200 h-100 p-4">
            <table className="text-gray-600 w-100 fs-8">
              <tbody>
                <tr>
                  <th className="text-end p-1">{translate('Category')}</th>
                  <td className="p-1">{props.category.title}</td>
                </tr>
                {showExperimentalUiComponents && (
                  <tr>
                    <th className="text-end p-1">{translate('Version')}</th>
                    <td className="p-1">5.2.1</td>
                  </tr>
                )}
              </tbody>
            </table>
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
          <PublicOfferingMetadataLink />
        </div>
      </PublicDashboardHero>
    </>
  );
};
