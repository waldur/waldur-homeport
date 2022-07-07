import { FunctionComponent } from 'react';
import { Badge, ListGroupItem, Stack } from 'react-bootstrap';

import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { translate } from '@waldur/i18n';

import './OrganizationListItem.scss';
import { ServiceProviderIcon } from './ServiceProviderIcon';
import { organizationUserRoles } from './utils';

export const OrganizationListItem: FunctionComponent<{
  data;
  index;
  user;
  style;
  selected;
  onSelect;
}> = ({ data, index, user, style, selected, onSelect }) => {
  const item = data[index];

  if (item.isFetching) {
    return (
      <ListGroupItem style={style} className="text-center">
        {translate('fetching')}
      </ListGroupItem>
    );
  }

  if (item.isFailed) {
    return (
      <ListGroupItem style={style} className="text-center">
        {translate('failed')}
      </ListGroupItem>
    );
  }

  return (
    <ListGroupItem
      active={selected}
      onClick={onSelect}
      style={style}
      className="organization-list-item cursor-pointer"
    >
      <Stack direction="horizontal" gap={4}>
        <ImagePlaceholder
          width="36px"
          height="36px"
          backgroundColor="#e2e2e2"
        />
        <span className="title">
          <span className={selected ? 'text-success' : ''}>{item.name}</span>
          <ServiceProviderIcon organization={item} className="ms-1" />
          {organizationUserRoles(item, user).map(
            (tag) =>
              tag.visible && (
                <Badge
                  key={tag.value}
                  bg="success"
                  text="success"
                  className="bg-opacity-10 ms-1"
                >
                  {tag.label}
                </Badge>
              ),
          )}
        </span>
        <i className="fa fa-wrench text-dark ms-auto" />
      </Stack>
    </ListGroupItem>
  );
};
