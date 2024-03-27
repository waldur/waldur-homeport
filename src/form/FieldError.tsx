import { capitalize, words } from 'lodash';
import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

const formatKey = (key: string) => capitalize(words(key).join(' '));

const getKeyValueElement = (error) => {
  if (!error || typeof error !== 'object') return error;
  return Object.entries(error).map(([key, value], i) =>
    isNaN(key as any) ? (
      <div key={key + i}>
        <strong>{formatKey(key)}:</strong> {getKeyValueElement(value)}
      </div>
    ) : (
      <div key={key + i}>{getKeyValueElement(value)}</div>
    ),
  );
};

const isOneLine = (error) => {
  if (typeof error === 'object') {
    return Object.keys(error).length <= 1;
  }
  return true;
};

interface FieldErrorProps {
  error?: string | object | Array<any>;
}

export const FieldError: FunctionComponent<FieldErrorProps> = (props) => {
  return props.error ? (
    <Form.Text
      className={'text-danger' + (isOneLine(props.error) ? '' : ' text-start')}
      as="div"
    >
      {Array.isArray(props.error)
        ? props.error.map((e, i) => <div key={i}>{e}</div>)
        : typeof props.error === 'object'
          ? getKeyValueElement(props.error)
          : props.error}
    </Form.Text>
  ) : null;
};
