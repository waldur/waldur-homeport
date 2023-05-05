import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { Field } from '@waldur/resource/summary';

import { CircleProgressStatus } from './CircleProgressStatus';
import { PublicOfferingDataCard } from './PublicOfferingDataCard';

interface PublicOfferingAccountingProps {
  offering: Offering;
}

export const PublicOfferingAccounting: FunctionComponent<PublicOfferingAccountingProps> =
  ({ offering }) => {
    if (!offering) return null;

    return (
      <PublicOfferingDataCard
        title={translate('Accounting')}
        icon="fa fa-usd"
        actions={
          <Button variant="light" className="mw-100px w-100">
            Edit
          </Button>
        }
        footer={
          <div className="d-flex justify-content-end">
            <CircleProgressStatus status="complete" />
          </div>
        }
      >
        <div className="mb-6">
          <Field label="Billing type:" spaceless>
            Fixed per month
          </Field>
        </div>
        <div className="mb-6">
          <strong>Components:</strong>
          <Field label="Cores (limit based):" spaceless>
            0-100
          </Field>
          <Field label="RAM (limit based):" spaceless>
            0-100
          </Field>
          <Field label="Storage (limit based):" spaceless>
            0-100
          </Field>
        </div>
        <div>
          <strong>Accounting plans:</strong>
          <p>
            - My first plan (per month)
            <br />- Plan 2 (per week)
          </p>
        </div>
      </PublicOfferingDataCard>
    );
  };
