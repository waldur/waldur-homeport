import { FunctionComponent } from 'react';

export const RolesRenderer: FunctionComponent<{ roles }> = ({ roles }) => (
  <>
    {roles.map((role, index) => (
      <span key={index}>
        {role.role}
        {index + 1 !== roles.length ? ', ' : null}
      </span>
    ))}
  </>
);
