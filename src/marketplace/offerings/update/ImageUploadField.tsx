import { TrashIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { BaseButton } from 'waldur-ui';

import { FileUploadField } from '@/form';
import { FileUploadFieldProps } from '@/form/FileUploadField';
import { withFormGroup } from '@/form/withFormGroup';
import { translate } from '@/i18n';

const getImageUrl = (image) => {
  if (image instanceof File) {
    return URL.createObjectURL(image);
  }
  if (typeof image === 'string') {
    return image;
  }
  return '';
};

const ImageUploadField: FunctionComponent<FileUploadFieldProps> = (props) => {
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
              variant="primary"
              size="sm"
              className="mb-2"
              {...props}
            />
          </div>
          {props.input.value && (
            <BaseButton
              variant="danger"
              size="sm"
              className="mb-2"
              label={translate('Remove')}
              onClick={() => props.input.onChange(null)}
              iconNode={<TrashIcon weight="bold" />}
            />
          )}
        </Col>
      </Row>
    </div>
  );
};

export const ImageUploadGroup = withFormGroup(ImageUploadField);
