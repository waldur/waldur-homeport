import { ArrowSquareOut } from '@phosphor-icons/react';
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
    {!props.iconless && (
      <span className="svg-icon svg-icon-2">
        <ArrowSquareOut />
      </span>
    )}{' '}
    {props.label}
  </a>
);
