import { translate } from '@waldur/i18n';

export const RobotAccountExpandable = ({ row }) => (
  <>
    {row.users.length > 0 ? (
      <>
        <strong>{translate('Users')}</strong>
        <ul>
          {row.users.map((user, index) => (
            <li key={index}>
              {user.full_name} ({user.username})
            </li>
          ))}
        </ul>
      </>
    ) : null}
    {row.keys.length > 0 ? (
      <>
        <strong>{translate('SSH keys')}</strong>
        <ul>
          {row.keys.map((key, index) => (
            <li key={index}>{key}</li>
          ))}
        </ul>
      </>
    ) : null}
  </>
);
