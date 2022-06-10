import { FunctionComponent } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import Gravatar from 'react-gravatar';

import { formatJsxTemplate, translate } from '@waldur/i18n';

export const AvatarField: FunctionComponent<any> = (props) => {
  return (
    <>
      <Form.Group as={Row} className="mb-8">
        <Form.Label column sm={3} md={4}>
          {translate('Profile picture')}
        </Form.Label>
        <Col sm={9} md={8}>
          <div className="logo">
            <div className="img-wrapper">
              <Gravatar email={props.user.email} size={100} />
            </div>
            <span className="manage-gravatar">
              {translate(
                'Manage avatar at {link}',
                {
                  link: (
                    <>
                      <br />
                      <a
                        href="https://gravatar.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        gravatar.com
                      </a>
                    </>
                  ),
                },
                formatJsxTemplate,
              )}
            </span>
          </div>
        </Col>
      </Form.Group>
    </>
  );
};
