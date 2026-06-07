import { Link } from '@/core/Link';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

export const UserDetailsLink = ({ uuid, name }) => {
  const currentUser = useUser();
  if (currentUser.is_staff || currentUser.is_support) {
    return (
      <Link state="support-user-manage" params={{ user_uuid: uuid }}>
        {name}
      </Link>
    );
  } else {
    return renderFieldOrDash(name);
  }
};
