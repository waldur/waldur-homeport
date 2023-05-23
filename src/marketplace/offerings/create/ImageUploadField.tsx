import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { FileUploadField } from '@waldur/form';
import { FileUploadFieldProps } from '@waldur/form/FileUploadField';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

const getImageUrl = (image) => {
  if (image instanceof File) {
    return URL.createObjectURL(image);
  }
  if (typeof image === 'string') {
    return image;
  }
  return '';
};

export const ImageUploadField: FunctionComponent<FileUploadFieldProps> = (
  props,
) => {
  if (!props.input.value) {
    return <FileUploadField {...props} />;
  }
  return (
    <div style={{ maxHeight: 200, maxWidth: 200 }}>
      <Row>
        <Col md={5}>
          <div className="image">
            <img
              src={getImageUrl(props.input.value)}
              alt={translate('Image here')}
              style={{
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        </Col>
        <Col md={7}>
          <div>
            <FileUploadField
              className="btn btn-sm btn-primary mb-2"
              {...props}
            />
          </div>
          {props.input.value && (
            <ActionButton
              className="btn btn-sm btn-danger mb-2"
              title={translate('Remove')}
              action={() => props.input.onChange(null)}
              icon="fa fa-trash"
            />
          )}
        </Col>
      </Row>
    </div>
  );
};
