import { ShieldWarning } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import {
  FC,
  useEffect,
  createContext,
  useContext,
  useState,
  PropsWithChildren,
  ReactNode,
} from 'react';
import { Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import {
  getCustomer,
  getProject,
  getUser,
  isStaffOrSupport,
} from '@waldur/workspace/selectors';

type Permission = 'allowed' | 'limited' | 'restricted' | 'custom';
interface PermissionMessage {
  title: string;
  message: string;
  options?: PermissionOptions;
}

interface PermissionOptions {
  className?: string;
}

type Banner = PermissionMessage | ReactNode;

interface PermissionContextInterface {
  permission: Permission;
  setPermission: (value: Permission) => void;
  banner: Banner;
  setBanner: (value: Banner) => void;
  pageMessage: PermissionMessage;
  setPageMessage: (value: PermissionMessage) => void;
  clearPermissionView: () => void;
}
interface PermissionViewProps {
  permission: Permission;
  banner?: Banner;
  pageMessage?: PermissionMessage;
}

export const PermissionContext = createContext<
  Partial<PermissionContextInterface>
>({});

const PermissionDataProvider: FC<PropsWithChildren> = ({ children }) => {
  const [permission, setPermission] = useState<Permission>('allowed');
  const [banner, setBanner] = useState<Banner>({
    title: '',
    message: '',
  });
  const [pageMessage, setPageMessage] = useState<PermissionMessage>({
    title: '',
    message: '',
  });

  const clearPermissionView = () => {
    setPermission('allowed');
    setBanner({ title: '', message: '' });
    setPageMessage({ title: '', message: '' });
  };

  const value: PermissionContextInterface = {
    permission,
    setPermission,
    banner,
    setBanner,
    pageMessage,
    setPageMessage,
    clearPermissionView,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

const RestrictedView = () => {
  const { pageMessage } = useContext(PermissionContext);
  return (
    <Card>
      <Card.Body>
        <div className="d-flex flex-column align-items-center justify-content-center my-10 my-xl-20 min-h-150px">
          <span className="svg-icon mb-6 svg-icon-5x text-danger">
            <ShieldWarning />
          </span>
          <h3 className="text-danger mb-4">{pageMessage.title}</h3>
          <p className="mb-10 text-dark mw-400px text-center">
            {pageMessage.message}
          </p>
          <Link state="profile.details" className="btn btn-primary">
            {translate('Go to profile')}
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

const PermissionLayout: FC<PropsWithChildren> = ({ children }) => {
  const {
    permission,
    setPermission,
    setBanner,
    pageMessage,
    setPageMessage,
    clearPermissionView,
  } = useContext(PermissionContext);

  const hasAllAccess = useSelector(isStaffOrSupport);
  const user = useSelector(getUser);
  const project = useSelector(getProject);
  const customer = useSelector(getCustomer);
  const { state, params } = useCurrentStateAndParams();

  const [hasPermissionView, setHasPermissionView] = useState(false);

  // Check users permissions
  useEffect(() => {
    if (!hasAllAccess && state.name && user) {
      if (isDescendantOf('project', state)) {
        if (
          !user.permissions.find(
            (permission) =>
              permission.scope_uuid === params.uuid &&
              permission.scope_type === 'project',
          ) &&
          !user.permissions.find(
            (permission) =>
              permission.scope_uuid === project.customer_uuid &&
              permission.scope_type === 'customer',
          )
        ) {
          setPermission('restricted');
          setBanner({
            title: translate('Restricted'),
            message: translate(
              'You do not have the permissions for accessing this page.',
            ),
          });
          setPageMessage({
            title: translate('Restricted page'),
            message: translate(
              'You do not have sufficient privileges to visit this page. Ensure you have the correct rights for accessing this page for project "{project}"',
              {
                project: project?.name || 'N/A',
              },
            ),
          });
          setHasPermissionView(true);
        } else {
          setHasPermissionView(false);
        }
      } else if (isDescendantOf('organization', state)) {
        if (
          !user.permissions.find(
            (permission) =>
              permission.scope_uuid === params.uuid &&
              permission.scope_type === 'customer',
          ) &&
          !user.permissions.find(
            (permission) =>
              permission.scope_type === 'project' &&
              permission.customer_uuid === params.uuid,
          )
        ) {
          setPermission('restricted');
          setBanner({
            title: translate('Restricted'),
            message: translate(
              'You do not have the permissions for accessing this page.',
            ),
          });
          setPageMessage({
            title: translate('Restricted page'),
            message: translate(
              'You do not have sufficient privileges to visit this page. Ensure you have the correct rights for accessing this page for customer "{customer}"',
              {
                customer: customer?.name || 'N/A',
              },
            ),
          });
          setHasPermissionView(true);
        } else {
          setHasPermissionView(false);
        }
      } else if (
        user.permissions.filter((permission) =>
          ['customer', 'project'].includes(permission.scope_type),
        ).length === 0 &&
        state.name === 'profile.details'
      ) {
        setPermission('limited');
        setBanner({
          title: translate('No association'),
          message: translate(
            'Your account is not part of any organization. Your view will be restricted.',
          ),
        });
        setHasPermissionView(true);
      } else {
        setHasPermissionView(false);
      }
    } else {
      setHasPermissionView(false);
    }
    return () => {
      if (permission !== 'allowed' && hasPermissionView) {
        clearPermissionView();
      }
    };
  }, [
    state,
    params,
    project,
    customer,
    user,
    hasPermissionView,
    setHasPermissionView,
  ]);

  return permission === 'restricted' && pageMessage ? (
    <RestrictedView />
  ) : (
    <>{children}</>
  );
};

const usePermissionView = (
  resolve: () => PermissionViewProps,
  deps: Array<any>,
) => {
  const { setPermission, setBanner, setPageMessage, clearPermissionView } =
    useContext(PermissionContext);
  const { state } = useCurrentStateAndParams();

  useEffect(() => {
    const params = resolve();
    if (params) {
      setPermission(params.permission);
      setBanner(params.banner);
      setPageMessage(params.pageMessage);
    } else {
      clearPermissionView();
    }
    return () => {
      clearPermissionView();
    };
  }, [...deps, state]);
};

export { PermissionDataProvider, PermissionLayout, usePermissionView };
