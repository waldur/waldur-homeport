import { FunctionComponent } from 'react';
import DatePicker from 'react-16-bootstrap-date-picker';

export const DateField: FunctionComponent<any> = (props) => {
  const { input, ...rest } = props;
  return <DatePicker {...input} dateFormat="YYYY-MM-DD" {...rest} />;
};
