import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { Field } from '@waldur/resource/summary';

import { CircleProgressStatus } from './CircleProgressStatus';
import { PublicOfferingDataCard } from './PublicOfferingDataCard';

interface PublicOfferingIntegrationProps {
  offering: Offering;
}

export const PublicOfferingIntegration: FunctionComponent<PublicOfferingIntegrationProps> =
  ({ offering }) => {
    if (!offering) return null;

    return (
      <PublicOfferingDataCard
        title={translate('Integration')}
        icon="fa fa-cog"
        actions={
          <Button variant="light" className="mw-100px w-100">
            Edit
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
        <div className="mb-6">
          <Field label="Integration type:" spaceless>
            OpenStack admin
          </Field>
        </div>
        <div className="mb-6">
          <Field label="API URL:" spaceless>
            http://keystone.example.com:5000/v3
          </Field>
        </div>
        <div className="mb-6">
          <Field label="Domain name:" spaceless>
            default
          </Field>
          <Field label="Username:" spaceless>
            admin
          </Field>
          <Field label="Password:" spaceless>
            **********
          </Field>
        </div>
        <div className="mb-6">
          <Field label="Tenant name:" spaceless>
            default
          </Field>
          <Field label="External network ID:" spaceless>
            93298438943843
          </Field>
          <Field label="Availability zone:" spaceless>
            OSLO1
          </Field>
        </div>
        <div>
          <Field label="Storage mode:" spaceless>
            Fixed
          </Field>
        </div>
      </PublicOfferingDataCard>
    );
  };
