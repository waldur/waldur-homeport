import { FunctionComponent } from 'react';

interface ExternalLinkProps {
  label: string;
  url: string;
  iconless?: boolean;
}

export const ExternalLink: FunctionComponent<ExternalLinkProps> = (props) => (
  <a href={props.url} target="_blank" rel="noopener noreferrer">
    {!props.iconless && <i className="fa fa-external-link" />} {props.label}
  </a>
);
