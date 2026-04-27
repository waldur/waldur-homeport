import { Link } from '@/core/Link';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

export const UserDetailsLink = ({ uuid, name }) => {
  const currentUser = useUser();
  if (currentUser.is_staff || currentUser.is_support) {
    return (
      <Link state="users.details" params={{ uuid }}>
        {name}
      </Link>
    );
  } else {
    return renderFieldOrDash(name);
  }
};
