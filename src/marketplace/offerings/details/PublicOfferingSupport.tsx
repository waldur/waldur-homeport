import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { Field } from '@waldur/resource/summary';

import { CircleProgressStatus } from './CircleProgressStatus';
import { PublicOfferingDataCard } from './PublicOfferingDataCard';

interface PublicOfferingSupportProps {
  offering: Offering;
}

export const PublicOfferingSupport: FunctionComponent<PublicOfferingSupportProps> =
  ({ offering }) => {
    if (!offering) return null;

    return (
      <PublicOfferingDataCard
        title={translate('Support')}
        icon="fa fa-life-ring"
        actions={
          <Button variant="light" className="mw-100px w-100">
            Edit
          </Button>
        }
        footer={
          <div className="d-flex justify-content-end">
            <CircleProgressStatus progress={55} />
          </div>
        }
      >
        <div className="mb-6">
          <Field label="Support Portal:" spaceless>
            <span></span>
          </Field>
          <Field label="Email:" spaceless>
            <span></span>
          </Field>
          <Field label="Phone:" spaceless>
            <span></span>
          </Field>
        </div>
        <div>
          <Field label="Terms of Service:" spaceless>
            <span></span>
          </Field>
          <Field label="Privacy Policy:" spaceless>
            <span></span>
          </Field>
        </div>
      </PublicOfferingDataCard>
    );
  };
