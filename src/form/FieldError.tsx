import classNames from 'classnames';
import { capitalize, words } from 'lodash-es';
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
  center?: boolean;
}

export const FieldErrorMessage: FunctionComponent<FieldErrorProps> = ({
  error,
  center,
}) => {
  return (
    <span className={classNames((isOneLine(error) || center) && 'text-start')}>
      {error
        ? Array.isArray(error)
          ? error.map((e, i) => <div key={i}>{e}</div>)
          : typeof error === 'object'
            ? getKeyValueElement(error)
            : error
        : null}
    </span>
  );
};

export const FieldError: FunctionComponent<FieldErrorProps> = ({
  error,
  center,
}) => {
  return error ? (
    <Form.Text className="text-danger" as="div">
      <FieldErrorMessage error={error} center={center} />
    </Form.Text>
  ) : null;
};
