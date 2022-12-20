import copy from 'copy-to-clipboard';
import { useCallback } from 'react';
import { Card, InputGroup, Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/notify';

export const ResourceAccessCard = ({ resource }) => {
  const dispatch = useDispatch();

  const copyText = useCallback(
    (value) => {
      copy(value);
      dispatch(showSuccess(translate('Text has been copied')));
    },
    [dispatch],
  );

  return resource.access_url || resource.username ? (
    <Card className="mb-7">
      <Card.Header>
        <Card.Title>
          <h3 className="mb-5">{translate('Access info')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        {resource.access_url && (
          <div className="my-3">
            <p>{translate('Access URL')}</p>
            <InputGroup>
              <Form.Control value={resource.access_url} disabled={true} />
              <Button
                variant="primary"
                onClick={() => copyText(resource.access_url)}
              >
                <i className="fa fa-copy fa-lg" />
              </Button>
            </InputGroup>
          </div>
        )}

        {resource.username && (
          <div className="my-3">
            <p>{translate('Username')}</p>
            <InputGroup>
              <Form.Control value={resource.username} disabled={true} />
              <Button
                variant="primary"
                onClick={() => copyText(resource.username)}
              >
                <i className="fa fa-copy fa-lg" />
              </Button>
            </InputGroup>
          </div>
        )}
      </Card.Body>
    </Card>
  ) : null;
};
