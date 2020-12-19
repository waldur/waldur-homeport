import { FunctionComponent } from 'react';

export interface ExternalLinkProps {
  label: string;
  url: string;
}

export const ExternalLink: FunctionComponent<ExternalLinkProps> = (props) => (
  <a href={props.url} target="_blank" rel="noopener noreferrer">
    <i className="fa fa-external-link" /> {props.label}
  </a>
);
