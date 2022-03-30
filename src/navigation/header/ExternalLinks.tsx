import { connect } from 'react-redux';

import { ExternalLink } from '@waldur/auth/types';
import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

interface ExternalLinksComponentProps {
  externalLinks: ExternalLink[];
  onSelect(eventKey: any): void;
}

const ExternalLinksComponent = (props: ExternalLinksComponentProps) =>
  props.externalLinks?.length > 0 && (
    <div className="menu-item here menu-lg-down-accordion me-lg-1">
      <span className="menu-link py-3">
        <span className="menu-title">{translate('External links')}</span>
        <span className="menu-arrow d-lg-none"></span>
      </span>
      <div className="menu-sub menu-sub-lg-down-accordion menu-sub-lg-dropdown menu-rounded-0 py-lg-4 w-lg-225px">
        {props.externalLinks.map((link, index) => (
          <div className="menu-item" key={index}>
            {link.label}
          </div>
        ))}
      </div>
    </div>
  );

const mapStateToProps = () => {
  const externalLinks = ENV.plugins.WALDUR_CORE.EXTERNAL_LINKS;
  return {
    externalLinks,
    onSelect: (eventKey: number) => window.open(externalLinks[eventKey].url),
  };
};

export const ExternalLinks = connect(mapStateToProps)(ExternalLinksComponent);
