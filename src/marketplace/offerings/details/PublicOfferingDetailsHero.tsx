import { FunctionComponent, useMemo } from 'react';
import { Card, Col, Row, Stack } from 'react-bootstrap';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogoMetronic';
import { getStartingPrice } from '@waldur/marketplace/details/plan/utils';
import { Category, Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { Logo } from '../service-providers/shared/Logo';
import './PublicOfferingDetailsHero.scss';

interface OwnProps {
  offering: Offering;
  category: Category;
}

export const PublicOfferingDetailsHero: FunctionComponent<OwnProps> = (
  props,
) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  const startingPrice = useMemo(() => {
    return getStartingPrice(props.offering);
  }, [props.offering]);

  return (
    <div
      className="public-offering-hero__background"
      style={
        props.offering.image
          ? { backgroundImage: `url(${props.offering.image})` }
          : {}
      }
    >
      <div className="public-offering-hero__table">
        <div className="public-offering-hero__cell">
          <div className="container-xxl pb-16">
            <div className="d-flex gap-20">
              <Card className="public-offering-logo">
                <Card.Body>
                  <OfferingLogo
                    src={props.offering.thumbnail}
                    size={50}
                    className="offering-small-logo"
                  />
                  <Logo
                    image={props.category.icon}
                    placeholder={props.category.title[0]}
                    height={100}
                    width={100}
                  />
                </Card.Body>
              </Card>
              <Card className="flex-grow-1">
                <Card.Body>
                  <Row>
                    <Col xl={7}>
                      <div className="d-flex flex-column justify-content-between h-100">
                        <div>
                          <h3>{props.offering.name}</h3>
                          <h5 className="fw-bold">
                            By{' '}
                            <Link
                              state="marketplace-service-provider.details"
                              params={{ uuid: props.offering.customer_uuid }}
                              className="text-decoration-underline text-dark text-hover-primary fs-7 mb-2"
                            >
                              {props.offering.customer_name}
                            </Link>
                          </h5>
                        </div>
                        <div className="d-flex justify-content-between align-items-end">
                          <div>
                            {showExperimentalUiComponents && (
                              <Stack direction="horizontal" gap={4}>
                                <span className="fw-bold">
                                  {translate('Components')}:
                                </span>
                                <i className="fa fa-microchip"></i>
                                <i className="fa fa-archive"></i>
                                <i className="fa fa-gears"></i>
                              </Stack>
                            )}
                          </div>
                          <div className="text-end">
                            <div className="text-gray-600 fs-7 fw-bold">
                              Starting at
                            </div>
                            <div className="text-dark fs-2 fw-bolder">
                              {defaultCurrency(startingPrice)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xl={5}>
                      <div className="bg-gray-200 h-100 p-4">
                        <table className="text-gray-600 w-100 fs-8">
                          <tbody>
                            <tr>
                              <th className="text-end p-1">
                                {translate('Category')}
                              </th>
                              <td className="p-1">{props.category.title}</td>
                            </tr>
                            {showExperimentalUiComponents && (
                              <tr>
                                <th className="text-end p-1">
                                  {translate('Version')}
                                </th>
                                <td className="p-1">5.2.1</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
