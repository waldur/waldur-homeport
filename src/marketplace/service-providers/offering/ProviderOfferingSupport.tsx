import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { Field } from '@waldur/resource/summary';

import { CircleProgressStatus } from './CircleProgressStatus';
import { ProviderOfferingDataCard } from './ProviderOfferingDataCard';

interface ProviderOfferingSupportProps {
  offering: Offering;
}

export const ProviderOfferingSupport: FunctionComponent<ProviderOfferingSupportProps> =
  ({ offering }) => {
    if (!offering) return null;

    return (
      <ProviderOfferingDataCard
        title={translate('Support')}
        icon="fa fa-life-ring"
        actions={
          <Button variant="light" className="mw-100px w-100">
            {translate('Edit')}
          </Button>
        }
        footer={
          <div className="d-flex justify-content-end">
            <CircleProgressStatus progress={55} />
          </div>
        }
      >
        <div className="mb-6">
          <Field label={translate('Support portal:')} spaceless>
            <span></span>
          </Field>
          <Field label={translate('Email:')} spaceless>
            <span></span>
          </Field>
          <Field label={translate('Phone:')} spaceless>
            <span></span>
          </Field>
        </div>
        <div>
          <Field label={translate('Terms of service:')} spaceless>
            <span></span>
          </Field>
          <Field label={translate('Privacy policy:')} spaceless>
            <span></span>
          </Field>
        </div>
      </ProviderOfferingDataCard>
    );
  };
