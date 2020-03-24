import * as React from 'react';
import * as Gravatar from 'react-gravatar';

export const GravatarField = ({ row }) => (
  <>
    <Gravatar email={row.email} size={25} default="mm" />{' '}
    {row.full_name || row.username}
  </>
);
