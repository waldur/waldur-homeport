import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { NestedScreenshot } from 'waldur-js-client';

import { openModalDialog } from '@waldur/modal/actions';

import { ImageDetailsDialog } from './ImageDetailsDialog';

interface ImagesTabProps {
  images: NestedScreenshot[];
}

export const ImagesTab: FunctionComponent<ImagesTabProps> = (props) => {
  const dispatch = useDispatch();
  return (
    <Row>
      {props.images.map((item, index) => (
        <Col key={index} md={4} className="text-center">
          <img
            src={item.thumbnail}
            alt="thumb"
            className="img-thumbnail m-xs"
            onClick={() =>
              dispatch(
                openModalDialog(ImageDetailsDialog, {
                  resolve: item,
                }),
              )
            }
            style={{ cursor: 'pointer' }}
            aria-hidden="true"
          />

          <h4 className="mt-3">{item.name}</h4>
          <p>{item.description}</p>
        </Col>
      ))}
    </Row>
  );
};
