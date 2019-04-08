import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { FileUploadField } from '@waldur/form-react';
import { FileUploadFieldProps } from '@waldur/form-react/FileUploadField';

import { translate } from '@waldur/i18n';
import ActionButton from '@waldur/table-react/ActionButton';

const getImageUrl = image => {
  if (image instanceof File) {
    return URL.createObjectURL(image);
  }
  if (typeof image === 'string') {
    return image;
  }
  return '';
};

export const ImageUploadField = (props: FileUploadFieldProps) => {
  if (!props.input.value) {
    return <FileUploadField {...props} />;
  }
  return (
    <div style={{maxHeight: 200, maxWidth: 200}}>
      <Row>
        <Col md={5}>
          <div className="image">
            <img src={getImageUrl(props.input.value)} alt={translate('Image here')}/>
          </div>
        </Col>
        <Col md={7}>
          <div>
            <FileUploadField className="btn btn-sm btn-primary m-b-sm" {...props}/>
          </div>
          {props.input.value &&
            <ActionButton
              className="btn btn-sm btn-danger m-b-sm"
              title={translate('Remove')}
              action={() => props.input.onChange(null)}
              icon="fa fa-trash"
            />
          }
        </Col>
      </Row>
    </div>
  );
};
