import * as React from 'react';

export const RolesRenderer = ({ roles }) => (
  <>
    {roles.map((role, index) => (
      <span key={index}>
        {role.role}
        {index + 1 !== roles.length ? ', ' : null}
      </span>
    ))}
  </>
);
