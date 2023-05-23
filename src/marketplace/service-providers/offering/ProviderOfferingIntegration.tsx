import { FunctionComponent, useState } from 'react';
import { Button } from 'react-bootstrap';

import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { translate } from '@waldur/i18n';
import {
  getAttributes,
  isOfferingTypeSchedulable,
  getOfferingTypes,
} from '@waldur/marketplace/common/registry';
import { AttributesTable } from '@waldur/marketplace/details/attributes/AttributesTable';
import { PageManagement } from '@waldur/marketplace/offerings/details/PageManagement';
import { Offering, Section } from '@waldur/marketplace/types';

import { CircleProgressStatus } from './CircleProgressStatus';
import { ProviderOfferingDataCard } from './ProviderOfferingDataCard';

const ManagementSummary = ({ offering }: { offering: Offering }) => {
  const section: Section = {
    key: 'management',
    title: translate('Management'),
    attributes: getAttributes(offering.type),
  };

  const attributes = offering.attributes;
  const schedules = offering.attributes?.schedules;
  const isSchedulable = isOfferingTypeSchedulable(offering.type);
  const typeLabel = getOfferingTypes().find(
    (option) => option.value === offering.type,
  ).label;

  return (
    <>
      <p>
        <strong>{translate('Type')}</strong>: {typeLabel}
      </p>
      {attributes && (
        <AttributesTable attributes={attributes} sections={[section]} />
      )}
      {/* Full calendar component is rendered as collapsed */}
      {schedules && isSchedulable && <Calendar events={schedules} />}
    </>
  );
};

interface ProviderOfferingIntegrationProps {
  offering: Offering;
}

export const ProviderOfferingIntegration: FunctionComponent<ProviderOfferingIntegrationProps> =
  ({ offering }) => {
    const [editMode, setEditMode] = useState(false);
    if (!offering) return null;

    return (
      <ProviderOfferingDataCard
        title={translate('Integration')}
        icon="fa fa-cog"
        actions={
          <Button
            variant={editMode ? 'light-danger' : 'light'}
            className="mw-100px w-100"
            onClick={() => setEditMode((prev) => !prev)}
          >
            {editMode ? translate('Cancel') : translate('Edit')}
          </Button>
        }
        footer={
          <div className="d-flex justify-content-end">
            <CircleProgressStatus
              status="error"
              message="API Error: 500 Access Denied."
            />
          </div>
        }
      >
        {editMode ? (
          <PageManagement offering={offering} hideHeader={true} />
        ) : (
          <ManagementSummary offering={offering} />
        )}
      </ProviderOfferingDataCard>
    );
  };
