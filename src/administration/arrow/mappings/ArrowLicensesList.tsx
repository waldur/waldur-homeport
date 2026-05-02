import { FC } from 'react';
import { Card, Table } from 'react-bootstrap';
import { ArrowLicense } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

interface ArrowLicensesListProps {
  licenses: ArrowLicense[];
}

export const ArrowLicensesList: FC<ArrowLicensesListProps> = ({ licenses }) => (
  <Card>
    <Card.Header>
      <h5 className="mb-0">
        {translate('Arrow Licenses')}
        <Badge variant="default" outline className="ms-2">
          {licenses?.length || 0}
        </Badge>
      </h5>
    </Card.Header>
    <Card.Body className="p-0">
      {!licenses || licenses.length === 0 ? (
        <div className="text-center text-muted py-6">
          {translate('No licenses found in Arrow billing export')}
        </div>
      ) : (
        <div className="table-responsive" style={{ maxHeight: '300px' }}>
          <Table className="mb-0" size="sm">
            <thead className="sticky-top bg-white">
              <tr>
                <th>{translate('License Reference')}</th>
                <th>{translate('Vendor')}</th>
                <th>{translate('Offer')}</th>
                <th>{translate('SKU')}</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((license, idx) => (
                <tr key={idx}>
                  <td>
                    <span className="small">{license.license_reference}</span>
                  </td>
                  <td>{license.vendor_name || DASH_ESCAPE_CODE}</td>
                  <td>
                    {license.offer_name ||
                      license.friendly_name ||
                      DASH_ESCAPE_CODE}
                  </td>
                  <td>{license.offer_sku || DASH_ESCAPE_CODE}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Card.Body>
  </Card>
);
