import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { useDispatch } from 'react-redux';

import { Screenshot } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';

import { ScreenshotDetailsDialog } from './ScreenshotDetailsDialog';

const openViewOfferingScreenshotDialog = (screenshot: Screenshot) =>
  openModalDialog(ScreenshotDetailsDialog, {
    resolve: screenshot,
  });

interface ScreenshotsTabProps {
  screenshots: Screenshot[];
}

export const ScreenshotsTab = (props: ScreenshotsTabProps) => {
  const dispatch = useDispatch();
  return (
    <Row>
      {props.screenshots.map((item, index) => (
        <Col key={index} md={4} className="text-center">
          <img
            src={item.thumbnail}
            className="img-thumbnail m-xs"
            onClick={() => dispatch(openViewOfferingScreenshotDialog(item))}
            style={{ cursor: 'pointer' }}
          />
          <h4 className="m-t-md">{item.name}</h4>
          <p>{item.description}</p>
        </Col>
      ))}
    </Row>
  );
};
