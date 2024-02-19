import { useRouter } from '@uirouter/react';
import { Col, Form, Row } from 'react-bootstrap';

import { SymbolsGroup } from '@waldur/customer/dashboard/SymbolsGroup';
import { GenericPermission, Role } from '@waldur/permissions/types';

export const UserRoleGroup = ({
  role,
  users,
}: {
  role: Role;
  users: GenericPermission[];
}) => {
  const router = useRouter();
  const goToUsers = () => router.stateService.go('organization-users');
  const items = users
    .filter((user) => user.role_name === role.name)
    .map((perm) => ({
      full_name: perm.user_full_name,
      username: perm.user_username,
      email: perm.user_email,
      image: perm.user_image,
    }));

  if (items.length === 0) {
    return null;
  }

  return (
    <Form.Group as={Row} className="mb-1">
      <Form.Label column xs="auto">
        {role.description}:
      </Form.Label>
      <Col xs={12} sm>
        <SymbolsGroup items={items} max={6} onClick={goToUsers} />
      </Col>
    </Form.Group>
  );
};
