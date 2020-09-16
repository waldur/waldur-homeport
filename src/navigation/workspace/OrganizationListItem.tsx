import * as React from 'react';
import * as ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

import { translate } from '@waldur/i18n';

import { OrganizationTitle } from './OrganizationTitle';
import { SelectOrganizationButton } from './SelectOrganizationButton';

export const OrganizationListItem = ({
  data,
  index,
  style,
  selected,
  onSelect,
}) => {
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
