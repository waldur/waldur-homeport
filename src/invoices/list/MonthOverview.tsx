import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from '@phosphor-icons/react';
import { FunctionComponent, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { ENV } from '@waldur/core/config';
import { parseDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Customer } from '@waldur/workspace/types';

import { groupInvoiceItems } from '../details/utils';
import { Invoice } from '../types';
import { formatPeriod } from '../utils';

import { EstimatedCost } from './EstimatedCost';

interface MonthOverviewProps {
  invoice: Invoice;
  customer: Customer;
  costTrend?: -1 | 0 | 1;
}

const OverviewItemTr = ({ title, value }) => {
  return (
    <tr>
      <td className="text-decoration-underline w-100 py-3">{title}</td>
      <td className="text-muted text-nowrap">{value}</td>
    </tr>
  );
};

export const MonthOverview: FunctionComponent<MonthOverviewProps> = ({
  invoice,
  customer,
  costTrend,
}) => {
  const isCurrentMonth = Boolean(
    invoice.state === 'pending' && !invoice.invoice_date,
  );
  const isAccountingMode = ENV.accountingMode === 'accounting';
  const maxProjectsShowCount = isCurrentMonth && !isAccountingMode ? 4 : 5;

  const projects = useMemo(() => {
    if (invoice) {
      return groupInvoiceItems(invoice.items);
    }
    return [];
  }, [invoice]);

  const showTotalSection =
    !isCurrentMonth &&
    projects &&
    projects.length > 1 &&
    Number(invoice.tax) > 0;

  const date = useMemo(() => {
    if (invoice) {
      return parseDate(
        formatPeriod({ year: invoice.year, month: invoice.month }),
      ).toFormat('LLLL yyyy');
    }
  }, [invoice]);

  if (!invoice) {
    return null;
  }

  return (
    <Card className="card-bordered h-100">
      <Card.Body>
        <Row className="h-100">
          <Col xs={6}>
            {isCurrentMonth && !isAccountingMode ? (
              <div className="d-flex align-items-center">
                <div className="text-start">
                  <EstimatedCost />
                  <h4 className="mb-4">{date}</h4>
                </div>
                <span className="text-dark ms-4 svg-icon svg-icon-2">
                  {costTrend === -1 ? (
                    <ArrowDownIcon size={20} />
                  ) : costTrend === 1 ? (
                    <ArrowUpIcon size={20} />
                  ) : (
                    <MinusIcon size={20} />
                  )}
                </span>
              </div>
            ) : (
              <h2 className="mb-6">{date}</h2>
            )}
            <table className="fs-8">
              <tbody>
                {projects.slice(0, maxProjectsShowCount).map((project) => (
                  <OverviewItemTr
                    key={project.resource_uuid}
                    title={project.resource_name}
                    value={defaultCurrency(project.total)}
                  />
                ))}
              </tbody>
            </table>
          </Col>
          <Col xs={6}>
            <div className="d-flex flex-column justify-content-between align-items-end h-100">
              <div>
                {showTotalSection && (
                  <table className="fw-bold fs-8 w-75">
                    <tbody>
                      {!isAccountingMode && (
                        <OverviewItemTr
                          title={translate('VAT')}
                          value={defaultCurrency(invoice.tax)}
                        />
                      )}
                      <OverviewItemTr
                        title={translate('Subtotal')}
                        value={defaultCurrency(invoice.price)}
                      />

                      <OverviewItemTr
                        title={translate('Total')}
                        value={defaultCurrency(invoice.total)}
                      />
                    </tbody>
                  </table>
                )}
              </div>
              <div>
                <Link
                  state="billingDetails"
                  params={{
                    uuid: customer.uuid,
                    invoice_uuid: invoice.uuid,
                  }}
                  className="btn btn-outline btn-outline-default btn-sm"
                >
                  {translate('Details')}
                </Link>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
