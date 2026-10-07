import { HelpIcon } from 'waldur-ui';

export const BackendIdTip = ({ backendId }) =>
  backendId ? (
    <>
      {' '}
      <HelpIcon label={backendId} />
    </>
  ) : null;
