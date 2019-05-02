import * as React from 'react';
import * as DropdownButton from 'react-bootstrap/lib/DropdownButton';
import * as MenuItem from 'react-bootstrap/lib/MenuItem';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getConfig } from '@waldur/store/config';
import { connectAngularComponent } from '@waldur/store/connect';

interface ExternalLink {
  label: string;
  url: string;
}

interface Props {
  externalLinks: ExternalLink[];
  onSelect(eventKey: any): void;
}

const ExternalLinksComponent = (props: Props) => props.externalLinks.length > 0 && (
  <DropdownButton
    title={translate('External links')}
    id="external-link-dropdown-btn"
    onSelect={props.onSelect}
    bsStyle="link"
  >
    {props.externalLinks.map((link, index) => (
      <MenuItem eventKey={index}>{link.label}</MenuItem>
    ))}
  </DropdownButton>
);

const mapStateToProps = state => {
  const externalLinks = getConfig(state).externalLinks;
  return {
    externalLinks,
    onSelect: (eventKey: number) => window.open(externalLinks[eventKey].url),
  };
};

const ExternalLinksContainer = connect(mapStateToProps)(ExternalLinksComponent);

export default connectAngularComponent(ExternalLinksContainer);
