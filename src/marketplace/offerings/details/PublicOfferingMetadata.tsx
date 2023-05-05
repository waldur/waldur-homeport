import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { Field } from '@waldur/resource/summary';

import { CircleProgressStatus } from './CircleProgressStatus';
import { PublicOfferingDataCard } from './PublicOfferingDataCard';

interface PublicOfferingMetadataProps {
  offering: Offering;
}

export const PublicOfferingMetadata: FunctionComponent<PublicOfferingMetadataProps> =
  ({ offering }) => {
    if (!offering) return null;

    return (
      <PublicOfferingDataCard
        title={translate('Metadata')}
        icon="fa fa-file-code-o"
        actions={
          <Button variant="light" className="mw-100px w-100">
            Edit
          </Button>
        }
        footer={
          <div className="d-flex justify-content-end">
            <CircleProgressStatus progress={23} />
          </div>
        }
      >
        <div className="mb-6">
          <Field label="Location:" spaceless>
            Tartu
          </Field>
        </div>
        <div className="mb-6">
          <Field label="Certifications:" spaceless>
            <span></span>
          </Field>
        </div>
        <div className="mb-6">
          <Field label="Virtualisation:" spaceless>
            <span></span>
          </Field>
          <Field label="Network:" spaceless>
            <span></span>
          </Field>
        </div>
        <div className="mb-6">
          <Field label="High Availability:" spaceless>
            <span></span>
          </Field>
          <Field label="Availability Monitoring:" spaceless>
            <span></span>
          </Field>
        </div>
        <div>
          <Field label="Operating System:" spaceless>
            <span></span>
          </Field>
          <Field label="Application:" spaceless>
            <span></span>
          </Field>
        </div>
      </PublicOfferingDataCard>
    );
  };
