import { FC } from 'react';
import { Card } from 'react-bootstrap';
import { ArrowLicense } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { SimpleTable } from '@/table/SimpleTable';

interface ArrowLicensesListProps {
  licenses: ArrowLicense[];
}

// Every license is in the discovery response, so the list scrolls rather
// than pages.
const ArrowLicensesTable: FC<ArrowLicensesListProps> = ({ licenses }) => (
  <div className="max-h-[300px] overflow-y-auto">
    <SimpleTable<ArrowLicense>
      columns={[
        {
          title: translate('License Reference'),
          render: ({ row }) => <>{row.license_reference}</>,
        },
        {
          title: translate('Vendor'),
          render: ({ row }) => <>{row.vendor_name || DASH_ESCAPE_CODE}</>,
        },
        {
          title: translate('Offer'),
          render: ({ row }) => (
            <>{row.offer_name || row.friendly_name || DASH_ESCAPE_CODE}</>
          ),
        },
        {
          title: translate('SKU'),
          render: ({ row }) => <>{row.offer_sku || DASH_ESCAPE_CODE}</>,
        },
      ]}
      rows={licenses}
    />
  </div>
);

export const ArrowLicensesList: FC<ArrowLicensesListProps> = ({ licenses }) => (
  <Card>
    <Card.Header>
      <h5 className="mb-0">
        {translate('Arrow Licenses')}
        <Badge variant="neutral" tone="outline" className="ms-1.5">
          {licenses?.length || 0}
        </Badge>
      </h5>
    </Card.Header>
    <Card.Body className="p-0">
      {!licenses || licenses.length === 0 ? (
        <div className="text-center text-quaternary py-5">
          {translate('No licenses found in Arrow billing export')}
        </div>
      ) : (
        <ArrowLicensesTable licenses={licenses} />
      )}
    </Card.Body>
  </Card>
);
