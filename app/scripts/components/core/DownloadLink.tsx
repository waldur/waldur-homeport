import * as React from 'react';
import { connect } from 'react-redux';

import { ExternalLink, ExternalLinkProps } from './ExternalLink';

interface DownloadLinkProps extends ExternalLinkProps {
  authToken?: string;
}

const PureDownloadLink = (props: DownloadLinkProps) => (
  <ExternalLink
    label={props.label}
    url={`${props.url}?x-auth-token=${props.authToken}&download=true`}/>
);

const mapStateToProps = ({ authToken }) => ({ authToken });

export const DownloadLink = connect(mapStateToProps, null)(PureDownloadLink);
