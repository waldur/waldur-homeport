import { QuestionIcon } from '@phosphor-icons/react';
import React, { useState } from 'react';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { usersPartialUpdate } from 'waldur-js-client';
import { User } from 'waldur-js-client';

import { Tip } from '@waldur/core/Tooltip';
import { SubmitButton } from '@waldur/form';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { SecretField } from '@waldur/marketplace/common/SecretField';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { useNotify } from '@waldur/store/hooks';

const TOKEN_OPTIONS = [
  { label: translate('{count} minutes', { count: 10 }), value: 600 },
  { label: translate('{count} minutes', { count: 30 }), value: 1800 },
  { label: translate('{count} hour', { count: 1 }), value: 3600 },
  { label: translate('{count} hours', { count: 2 }), value: 7200 },
  { label: translate('{count} hours', { count: 12 }), value: 43200 },
  { label: translate('token will not timeout'), value: null },
];

interface UserEditTokenComponentProps {
  user: User;
}

export const UserTokenLifetime: React.FC<UserEditTokenComponentProps> = (
  props,
) => {
  const [tokenLifetime, setTokenLifetime] = useState(
    TOKEN_OPTIONS.find((option) => option.value === props.user.token_lifetime),
  );
  const [submitting, setSubmitting] = useState(false);

  const { showSuccess, showErrorResponse } = useNotify();

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await usersPartialUpdate({
        path: { uuid: props.user.uuid },
        body: {
          token_lifetime: tokenLifetime.value,
        },
      });
      showSuccess(translate('User has been updated'));
    } catch (error) {
      showErrorResponse(error, translate('User could not be updated'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="card-bordered mb-6">
      <Card.Header>
        <Row className="card-toolbar g-0 gap-4 w-100">
          <Col xs className="order-0 mw-sm-25">
            <Card.Title>
              <span className="h3 me-2">{translate('API token')}</span>
            </Card.Title>
          </Col>
          <Col sm="auto" className="order-1 order-sm-2 min-w-25 ms-auto">
            <div className="d-flex justify-content-sm-end flex-wrap flex-sm-nowrap text-nowrap gap-3">
              <SubmitButton
                className="btn btn-primary btn-metro me-2"
                submitting={submitting}
                onClick={() => {
                  handleSubmit();
                }}
                label={translate('Save changes')}
              />
            </div>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <FormGroup label={translate('API token')}>
          <SecretField value={props.user.token} />
        </FormGroup>
        <FormGroup
          label={
            <Tip
              id="token"
              label={translate(
                'Lifetime will be updated and reset upon saving the form. Token lifetime is prolonged each time a successful API call with the token is done.',
              )}
            >
              {translate('Token lifetime')} <QuestionIcon />
            </Tip>
          }
        >
          <Select
            value={tokenLifetime}
            options={TOKEN_OPTIONS}
            onChange={(value) => setTokenLifetime(value)}
          />
        </FormGroup>
        {tokenLifetime?.value === null ? (
          <Form.Group>
            <Form.Text className="text-danger">
              {translate(
                'By setting token lifetime to indefinite you are allowing anyone who has the token to impersonate your actions till the token has been changed.',
              )}
              {translate(
                'Please make sure you know what you are doing and set to 10 minutes if unsure.',
              )}
            </Form.Text>
          </Form.Group>
        ) : null}
      </Card.Body>
    </Card>
  );
};
