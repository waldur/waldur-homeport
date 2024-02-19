import { useMemo } from 'react';
import { Col, Form, Row } from 'react-bootstrap';

import { SymbolsGroup } from '@waldur/customer/dashboard/SymbolsGroup';
import { GenericPermission, Role } from '@waldur/permissions/types';

export const UserRoleGroup = ({
  role,
  users,
  altLabel,
  max,
  className,
  onClick,
}: {
  role?: Role;
  users: GenericPermission[];
  altLabel?: string;
  max?: number;
  className?: string;
  onClick?(): any;
}) => {
  const items = useMemo(() => {
    let _items;
    if (role) {
      _items = users.filter((user) => user.role_name === role.name);
    } else {
      _items = users;
    }
    return _items.map((perm) => ({
      full_name: perm.user_full_name,
      username: perm.user_username,
      email: perm.user_email,
    }));
  }, [users, role]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Form.Group as={Row} className={className}>
      <Form.Label column xs="auto">
        {altLabel || role?.description}:
      </Form.Label>
      <Col xs={12} sm>
        <SymbolsGroup items={items} max={max || 6} onClick={onClick} />
      </Col>
    </Form.Group>
  );
};
