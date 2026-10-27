import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { Card } from 'react-bootstrap';

import { Image } from './Image';
import { ImagePlaceholder } from './ImagePlaceholder';
import { getAbbreviation } from './utils';

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
    className={classNames(
      'model-card-1 card-bordered h-full overflow-hidden',
      props.clickable && 'cursor-pointer border-hover-brand',
    )}
    onClick={props.onClick}
  >
    {(props.image || props.placeholder) && (
      <div className="h-[85px] flex items-center justify-center border-b-[1px] border-b-secondary">
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
    <Card.Body className="p-4 flex flex-col">
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
            'ellipsis-lines-' + ellipsisLines,
            'grow',
            'model-card-title-container',
          )}
        >
          <Card.Title
            className={classNames(
              'text-base font-medium',
              'ellipsis-lines-' + ellipsisLines,
              'model-card-title',
              !props.subtitle && 'mb-0',
            )}
          >
            {props.titleNode || props.title}
          </Card.Title>
          {props.subtitle && (
            <Card.Subtitle className="text-tertiary font-medium ellipsis">
              {props.subtitle}
            </Card.Subtitle>
          )}
        </div>
      </div>
      {props.body &&
        (typeof props.body === 'object' ? (
          props.body
        ) : (
          <Card.Text className="text-quaternary text-sm grow shrink-0 ellipsis-lines-3">
            {props.body}
          </Card.Text>
        ))}
    </Card.Body>
    {props.footer && (
      <Card.Footer className="py-3 px-4">{props.footer}</Card.Footer>
    )}
  </Card>
);
