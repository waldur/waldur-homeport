import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { buttonVariants } from 'waldur-ui';

import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';

interface PublicOfferingDocumentationAndSupportProps {
  offering: Offering;
}

export const PublicOfferingDocumentationAndSupport: FunctionComponent<
  PublicOfferingDocumentationAndSupportProps
> = ({ offering }) => (
  <Panel
    title={translate('Documentation & support')}
    cardBordered
    className="mb-8"
  >
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
  </Panel>
);
