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
}

export const ModelCard1: FC<ModelCard1Props> = ({
  ellipsisLines = 1,
  ...props
}) => (
  <Card
    className={classNames(
      'model-card-1 card-bordered h-100 overflow-hidden',
      props.clickable && 'cursor-pointer border-hover-brand',
    )}
  >
    {(props.image || props.placeholder) && (
      <div className="h-85px d-flex flex-center border-bottom">
        {props.image ? (
          <img
            alt="model-card"
            src={props.image}
            height={85}
            style={
              props.imageCover ? { objectFit: 'cover' } : { padding: '10px' }
            }
            className={props.imageCover ? 'w-100 h-100' : 'm-auto'}
          />
        ) : (
          props.placeholder
        )}
      </div>
    )}
    <Card.Body className="p-5 d-flex flex-column">
      <div
        className={classNames(
          'd-flex align-items-center gap-4',
          props.body && 'mb-6',
        )}
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
            'flex-grow-1',
            'model-card-title-container',
          )}
        >
          <Card.Title
            className={classNames(
              'fs-4 fw-bold',
              'ellipsis-lines-' + ellipsisLines,
              'model-card-title',
              !props.subtitle && 'mb-0',
            )}
          >
            {props.titleNode || props.title}
          </Card.Title>
          {props.subtitle && (
            <Card.Subtitle className="text-gray-600 fw-bold ellipsis">
              {props.subtitle}
            </Card.Subtitle>
          )}
        </div>
      </div>
      {props.body &&
        (typeof props.body === 'object' ? (
          props.body
        ) : (
          <Card.Text className="text-muted fs-6 flex-grow-1 flex-shrink-0 ellipsis-lines-3">
            {props.body}
          </Card.Text>
        ))}
    </Card.Body>
    {props.footer && (
      <Card.Footer className="py-4 px-5">{props.footer}</Card.Footer>
    )}
  </Card>
);
