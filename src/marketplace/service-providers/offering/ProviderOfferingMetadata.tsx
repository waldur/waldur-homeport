import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { Field } from '@waldur/resource/summary';

import { CircleProgressStatus } from './CircleProgressStatus';
import { ProviderOfferingDataCard } from './ProviderOfferingDataCard';

interface ProviderOfferingMetadataProps {
  offering: Offering;
}

export const ProviderOfferingMetadata: FunctionComponent<ProviderOfferingMetadataProps> =
  ({ offering }) => {
    if (!offering) return null;

    return (
      <ProviderOfferingDataCard
        title={translate('Metadata')}
        icon="fa fa-file-code-o"
        actions={
          <Button variant="light" className="mw-100px w-100">
            {translate('Edit')}
          </Button>
        }
        footer={
          <div className="d-flex justify-content-end">
            <CircleProgressStatus progress={23} />
          </div>
        }
      >
        <div className="mb-6">
          <Field label={translate('Location:')} spaceless>
            Tartu
          </Field>
        </div>
        <div className="mb-6">
          <Field label={translate('Certifications:')} spaceless>
            <span></span>
          </Field>
        </div>
        <div className="mb-6">
          <Field label={translate('Virtualisation:')} spaceless>
            <span></span>
          </Field>
          <Field label={translate('Network:')} spaceless>
            <span></span>
          </Field>
        </div>
        <div className="mb-6">
          <Field label={translate('High availability:')} spaceless>
            <span></span>
          </Field>
          <Field label={translate('Availability monitoring:')} spaceless>
            <span></span>
          </Field>
        </div>
        <div>
          <Field label={translate('Operating system:')} spaceless>
            <span></span>
          </Field>
          <Field label={translate('Application:')} spaceless>
            <span></span>
          </Field>
        </div>
      </ProviderOfferingDataCard>
    );
  };
