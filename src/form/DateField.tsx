import { FunctionComponent } from 'react';
import DatePicker from 'react-datepicker';

export const DateField: FunctionComponent<any> = (props) => {
  const { input, ...rest } = props;
  return <DatePicker {...input} dateFormat="YYYY-MM-DD" {...rest} />;
};
