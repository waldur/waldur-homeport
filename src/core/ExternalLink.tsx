import * as React from 'react';

export interface ExternalLinkProps {
  label: string;
  url: string;
}

export const ExternalLink = (props: ExternalLinkProps) => (
  <a href={props.url} target="_blank" rel="noopener noreferrer">
    <i className="fa fa-external-link" /> {props.label}
  </a>
);
