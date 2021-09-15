import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { getLabel } from '@waldur/marketplace/common/registry';
import {
  shouldRenderAttributesList,
  shouldRenderAttributesSection,
} from '@waldur/marketplace/offerings/details/utils';
import { Category, Offering } from '@waldur/marketplace/types';
import './PublicOfferingDescriptionContainer.scss';

interface PublicOfferingDescriptionContainerProps {
  offering: Offering;
  category: Category;
  googleCalendarLink: string;
}

export const PublicOfferingDescriptionContainer: FunctionComponent<PublicOfferingDescriptionContainerProps> = ({
  offering,
  category,
  googleCalendarLink,
}) => (
  <div
    className={classNames('bordered publicOfferingDescriptionContainer', {
      'publicOfferingDescriptionContainer--fullWidth': !(
        shouldRenderAttributesSection(offering, googleCalendarLink) ||
        shouldRenderAttributesList(category.sections, offering.attributes)
      ),
    })}
  >
    <div className="publicOfferingDescriptionContainer__header bordered">
      <div>
        <b>{translate('Type')}: </b>
        {getLabel(offering.type)}
      </div>
      <div>
        <b>{translate('Category')}: </b>
        {offering.category_title}
      </div>
      {offering.privacy_policy_link ? (
        <ExternalLink
          label={translate('Privacy Policy')}
          url={offering.privacy_policy_link}
        />
      ) : (
        <span>
          <b>{translate('Privacy Policy')}: </b>N/A
        </span>
      )}
      {offering.terms_of_service_link ? (
        <ExternalLink
          label={translate('Terms Of Service')}
          url={offering.terms_of_service_link}
        />
      ) : (
        <span>
          <b>{translate('Terms Of Service')}: </b>N/A
        </span>
      )}
    </div>
    {offering.full_description && (
      <div className="publicOfferingDescriptionContainer__description m-t-sm">
        <b>{translate('Description')}</b>
        <FormattedHtml html={offering.full_description} />
      </div>
    )}
  </div>
);
