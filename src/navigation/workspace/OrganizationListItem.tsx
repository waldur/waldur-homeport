import { FunctionComponent } from 'react';
import { ListGroupItem } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { OrganizationTitle } from './OrganizationTitle';
import { SelectOrganizationButton } from './SelectOrganizationButton';

export const OrganizationListItem: FunctionComponent<{
  data;
  index;
  style;
  selected;
  onSelect;
}> = ({ data, index, style, selected, onSelect }) => {
  const item = data[index];

  if (item.isFetching) {
    return <ListGroupItem style={style}>{translate('fetching')}</ListGroupItem>;
  }

  if (item.isFailed) {
    return <ListGroupItem style={style}>{translate('failed')}</ListGroupItem>;
  }

  return (
    <ListGroupItem active={selected} onClick={onSelect} style={style}>
      <SelectOrganizationButton organization={item} />
      <OrganizationTitle organization={item} />
    </ListGroupItem>
  );
};
