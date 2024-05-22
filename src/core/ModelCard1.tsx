import { FC, ReactNode } from 'react';
import { Card } from 'react-bootstrap';

import { Image } from './Image';
import { ImagePlaceholder } from './ImagePlaceholder';
import { getAbbreviation } from './utils';

interface ModelCard1Props {
  title: string;
  subtitle?: string;
  logo?: string;
  body?: ReactNode;
  image?: string;
  placeholder?: ReactNode;
  footer?: ReactNode;
}

export const ModelCard1: FC<ModelCard1Props> = (props) => (
  <Card className="model-card-1 card-bordered h-100">
    {(props.image || props.placeholder) && (
      <div className="h-90px d-flex flex-center border-bottom">
        {props.image ? (
          <img
            alt="model-card"
            src={props.image}
            height={90}
            style={{ margin: 'auto' }}
          />
        ) : (
          props.placeholder
        )}
      </div>
    )}
    <Card.Body className="p-7 d-flex flex-column">
      <div
        className={
          'd-flex align-items-center gap-2' + (props.body ? ' mb-7' : '')
        }
      >
        {props.logo ? (
          <Image src={props.logo} size={50} isContain />
        ) : (
          <ImagePlaceholder width="50px" height="50px">
            {getAbbreviation(props.title, 3)}
          </ImagePlaceholder>
        )}
        <div className="ellipsis">
          <Card.Title className="fs-4 fw-bold ellipsis">
            {props.title}
          </Card.Title>
          {props.subtitle && (
            <Card.Subtitle className="text-gray-600 fw-normal ellipsis">
              {props.subtitle}
            </Card.Subtitle>
          )}
        </div>
      </div>
      {props.body &&
        (typeof props.body === 'object' ? (
          props.body
        ) : (
          <Card.Text className="text-gray-600 flex-grow-1 flex-shrink-0 ellipsis-lines-3">
            {props.body}
          </Card.Text>
        ))}
    </Card.Body>
    {props.footer && (
      <Card.Footer className="py-5 px-7">{props.footer}</Card.Footer>
    )}
  </Card>
);
