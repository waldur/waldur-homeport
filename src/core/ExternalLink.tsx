import { FunctionComponent } from 'react';

interface ExternalLinkProps {
  label: string;
  url: string;
  iconless?: boolean;
  className?: string;
}

export const ExternalLink: FunctionComponent<ExternalLinkProps> = (props) => (
  <a
    href={props.url}
    target="_blank"
    rel="noopener noreferrer"
    className={props.className}
  >
    {!props.iconless && <i className="fa fa-external-link" />} {props.label}
  </a>
);
