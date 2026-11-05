import classNames from 'classnames';
import { FC, ReactNode } from 'react';

import { Card, CardContent, CardFooter } from 'waldur-ui';

import { Image } from './Image';
import { ImagePlaceholder } from './ImagePlaceholder';
import { getAbbreviation } from './utils';

const LINE_CLAMP = { 1: 'line-clamp-1', 2: 'line-clamp-2', 3: 'line-clamp-3' };

interface ModelCard1Props {
  title: string;
  titleNode?: ReactNode;
  subtitle?: string;
  ellipsisLines?: 1 | 2 | 3;
  logo?: string;
  body?: ReactNode;
  image?: string;
  imageCover?: boolean;
  placeholder?: ReactNode;
  footer?: ReactNode;
  clickable?: boolean;
  onClick?: () => void;
}

export const ModelCard1: FC<ModelCard1Props> = ({
  ellipsisLines = 1,
  ...props
}) => (
  <Card
    bordered
    className={classNames(
      'h-full overflow-hidden',
      props.clickable && 'cursor-pointer hover:border-brand',
    )}
    data-testid="model-card"
    onClick={props.onClick}
  >
    {(props.image || props.placeholder) && (
      <div className="h-[85px] flex items-center justify-center border-b border-b-secondary">
        {props.image ? (
          <img
            alt="model-card"
            src={props.image}
            height={85}
            style={
              props.imageCover ? { objectFit: 'cover' } : { padding: '10px' }
            }
            className={props.imageCover ? 'w-full h-full' : 'm-auto'}
          />
        ) : (
          props.placeholder
        )}
      </div>
    )}
    <CardContent className="p-4 flex flex-col">
      <div
        className={classNames('flex items-center gap-3', props.body && 'mb-5')}
      >
        {props.logo ? (
          <Image src={props.logo} size={48} isContain circle />
        ) : (
          <ImagePlaceholder width="48px" height="48px" circle>
            {getAbbreviation(props.title, 3)}
          </ImagePlaceholder>
        )}
        <div
          className={classNames(
            LINE_CLAMP[ellipsisLines],
            // min-w-0 lets the title shrink past its longest word; line-clamp
            // already clips it, and the title inherits the word breaking.
            'grow min-w-0 wrap-break-word',
          )}
        >
          <div
            className={classNames(
              'text-base font-medium',
              LINE_CLAMP[ellipsisLines],
              // Bootstrap's .card-title margin.
              props.subtitle ? 'mb-[var(--card-title-spacer-y)]' : 'mb-0',
            )}
          >
            {props.titleNode || props.title}
          </div>
          {props.subtitle && (
            <div className="-mt-[calc(var(--card-title-spacer-y)*0.5)] text-tertiary font-medium ellipsis">
              {props.subtitle}
            </div>
          )}
        </div>
      </div>
      {props.body &&
        (typeof props.body === 'object' ? (
          props.body
        ) : (
          <p className="last:mb-0 text-quaternary text-sm grow shrink-0 line-clamp-3">
            {props.body}
          </p>
        ))}
    </CardContent>
    {props.footer && (
      <CardFooter className="py-3 px-4">{props.footer}</CardFooter>
    )}
  </Card>
);
