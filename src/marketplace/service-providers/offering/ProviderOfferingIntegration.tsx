import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { Field } from '@waldur/resource/summary';

import { CircleProgressStatus } from './CircleProgressStatus';
import { ProviderOfferingDataCard } from './ProviderOfferingDataCard';

interface ProviderOfferingIntegrationProps {
  offering: Offering;
}

export const ProviderOfferingIntegration: FunctionComponent<ProviderOfferingIntegrationProps> =
  ({ offering }) => {
    if (!offering) return null;

    return (
      <ProviderOfferingDataCard
        title={translate('Integration')}
        icon="fa fa-cog"
        actions={
          <Button variant="light" className="mw-100px w-100">
            {translate('Edit')}
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
          <Field label={translate('Integration type:')} spaceless>
            OpenStack admin
          </Field>
        </div>
        <div className="mb-6">
          <Field label={translate('API URL:')} spaceless>
            http://keystone.example.com:5000/v3
          </Field>
        </div>
        <div className="mb-6">
          <Field label={translate('Domain name:')} spaceless>
            default
          </Field>
          <Field label={translate('Username:')} spaceless>
            admin
          </Field>
          <Field label={translate('Password:')} spaceless>
            **********
          </Field>
        </div>
        <div className="mb-6">
          <Field label={translate('Tenant name:')} spaceless>
            default
          </Field>
          <Field label={translate('External network ID:')} spaceless>
            93298438943843
          </Field>
          <Field label={translate('Availability zone:')} spaceless>
            OSLO1
          </Field>
        </div>
        <div>
          <Field label={translate('Storage mode:')} spaceless>
            Fixed
          </Field>
        </div>
      </ProviderOfferingDataCard>
    );
  };
