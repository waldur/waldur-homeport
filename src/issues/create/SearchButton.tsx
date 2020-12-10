import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';

import { registrationFormValuesSelector } from './selectors';

export const SearchButton = ({ onSearch }) => {
  const issue = useSelector(registrationFormValuesSelector);
  const callback = () => onSearch(issue);
  return (
    <Button onClick={callback}>
      <i className="fa fa-search" /> {translate('Search')}
    </Button>
  );
};
