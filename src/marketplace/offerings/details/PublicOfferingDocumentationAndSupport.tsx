import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { buttonVariants, Card, CardContent } from 'waldur-ui';

import { translate } from '@/i18n';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

interface PublicOfferingDocumentationAndSupportProps {
  offering: Offering;
}

export const PublicOfferingDocumentationAndSupport: FunctionComponent<
  PublicOfferingDocumentationAndSupportProps
> = ({ offering }) => (
  <Card bordered className="mb-8">
    <CardContent>
      <PublicOfferingCardTitle>
        {translate('Documentation & support')}
      </PublicOfferingCardTitle>
      <div className="flex flex-col gap-3">
        {offering.documentation_url && (
          <div>
            <p className="font-medium mb-1">
              {translate('Service documentation')}
            </p>
            <a
              href={offering.documentation_url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'tertiary' })}
            >
              <ArrowSquareOutIcon size={20} weight="bold" />
              {translate('Open documentation')}
            </a>
          </div>
        )}
        {offering.helpdesk_url && (
          <div>
            <p className="font-medium mb-1">{translate('Service support')}</p>
            <a
              href={offering.helpdesk_url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'tertiary' })}
            >
              <ArrowSquareOutIcon size={20} weight="bold" />
              {translate('Open helpdesk')}
            </a>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);
