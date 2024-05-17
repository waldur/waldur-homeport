import { Cpu, Database, Memory } from '@phosphor-icons/react';
import { FunctionComponent, useMemo } from 'react';
import { Card, Col, Row, Stack } from 'react-bootstrap';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { getStartingPrice } from '@waldur/marketplace/details/plan/utils';
import { Category, Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

interface PublicOfferingGeneralProps {
  offering: Offering;
  category: Category;
}

export const PublicOfferingGeneral: FunctionComponent<
  PublicOfferingGeneralProps
> = ({ offering, category }) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  const startingPrice = useMemo(() => {
    return getStartingPrice(offering);
  }, [offering]);

  return (
    <Card>
      <Card.Body>
        <Row>
          <Col xl={7}>
            <div className="d-flex flex-column justify-content-between h-100">
              <div>
                <h3>{offering.name}</h3>
                <h5 className="fw-bold">
                  {translate(
                    'By {customer}',
                    {
                      customer: (
                        <Link
                          state="marketplace-service-provider.details"
                          params={{ uuid: offering.customer_uuid }}
                          className="text-decoration-underline text-dark text-hover-primary fs-7 mb-2"
                        >
                          {offering.customer_name}
                        </Link>
                      ),
                    },
                    formatJsxTemplate,
                  )}
                </h5>
              </div>
              <div className="d-flex justify-content-between align-items-end">
                <div>
                  {showExperimentalUiComponents && (
                    <Stack direction="horizontal" gap={4}>
                      <span className="fw-bold">
                        {translate('Components')}:
                      </span>
                      <Cpu size={20} />
                      <Database size={20} />
                      <Memory size={20} />
                    </Stack>
                  )}
                </div>
                <div className="text-end">
                  <div className="text-gray-600 fs-7 fw-bold">
                    {translate('Starting at')}
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
                    <th className="text-end p-1">{translate('Category')}</th>
                    <td className="p-1">{category.title}</td>
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
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
