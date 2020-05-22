import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { connect } from 'react-redux';

import { Screenshot } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';

const openViewOfferingScreenshotDialog = (screenshot: Screenshot) =>
  openModalDialog('marketplaceViewOfferingScreenshotDialog', {
    resolve: screenshot,
  });

interface ScreenshotsTabProps {
  screenshots: Screenshot[];
  openViewScreenshotDialog(item);
}

const ScreenshotsTabContainer = (props: ScreenshotsTabProps) => (
  <Row>
    {props.screenshots.map((item, index) => (
      <Col key={index} md={4} className="text-center">
        <img
          src={item.thumbnail}
          className="img-thumbnail m-xs"
          onClick={() => props.openViewScreenshotDialog(item)}
          style={{ cursor: 'pointer' }}
        />
        <h4 className="m-t-md">{item.name}</h4>
        <p>{item.description}</p>
      </Col>
    ))}
  </Row>
);

const mapDispatchToProps = dispatch => ({
  openViewScreenshotDialog: image =>
    dispatch(openViewOfferingScreenshotDialog(image)),
});

export const ScreenshotsTab = connect(
  null,
  mapDispatchToProps,
)(ScreenshotsTabContainer);
