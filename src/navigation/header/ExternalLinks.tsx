import { DropdownButton, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getConfig } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

interface ExternalLink {
  label: string;
  url: string;
}

interface Props {
  externalLinks: ExternalLink[];
  onSelect(eventKey: any): void;
}

const ExternalLinksComponent = (props: Props) =>
  props.externalLinks.length > 0 && (
    <DropdownButton
      title={translate('External links')}
      id="external-link-dropdown-btn"
      onSelect={props.onSelect}
      bsStyle="link"
    >
      {props.externalLinks.map((link, index) => (
        <MenuItem eventKey={index} key={index}>
          {link.label}
        </MenuItem>
      ))}
    </DropdownButton>
  );

const mapStateToProps = (state: RootState) => {
  const externalLinks = getConfig(state).externalLinks;
  return {
    externalLinks,
    onSelect: (eventKey: number) => window.open(externalLinks[eventKey].url),
  };
};

export const ExternalLinks = connect(mapStateToProps)(ExternalLinksComponent);
