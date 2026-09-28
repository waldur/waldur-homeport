import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { ButtonVariant, buttonVariants, cn, ButtonSize } from 'waldur-ui';

interface ExternalLinkProps {
  label: string;
  url: string;
  iconless?: boolean;
  className?: string;
  buttonVariant?: ButtonVariant;
  /** Only meaningful alongside `buttonVariant`. Defaults to 'md', matching BaseButton. */
  buttonSize?: ButtonSize;
}

export const ExternalLink: FunctionComponent<ExternalLinkProps> = (props) => (
  <a
    href={props.url}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      props.buttonVariant &&
        buttonVariants({
          variant: props.buttonVariant,
          size: props.buttonSize,
        }),
      props.className,
    )}
  >
    {!props.iconless && <ArrowSquareOutIcon size={20} weight="bold" />}{' '}
    {props.label}
  </a>
);
