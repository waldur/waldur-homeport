import { ShieldWarningIcon } from '@phosphor-icons/react';
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

import { Card, CardContent } from 'waldur-ui';

import { Link } from '@/core/Link';
import { formatJsxTemplate, translate } from '@/i18n';
import { isCallsSectionVisible } from '@/marketplace/serviceAccessMode';
import { isDescendantOf } from '@/navigation/useTabs';
import { canAccessProjectDashboard } from '@/permissions/canAccessProjectDashboard';
import { isReadOnlyProjectReader } from '@/permissions/isReadOnlyProjectReader';
import { useUser, useCustomer, useProject } from '@/workspace/hooks';

import { hasAnyRole } from './hasAnyRole';

type Permission = 'allowed' | 'limited' | 'restricted';
interface PermissionMessage {
  title: string;
  message: ReactNode;
  options?: PermissionOptions;
}

interface PermissionOptions {
  className?: string;
}

// Markup a page shows above itself goes through LayoutSlot "announcements".
type Banner = PermissionMessage;

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
    <Card bordered>
      <CardContent>
        <div className="flex flex-col items-center justify-center my-8 xl:my-16 min-h-[150px]">
          <ShieldWarningIcon
            size={65}
            weight="bold"
            className="mb-5 text-danger"
          />
          <h3 className="text-danger mb-3">{pageMessage.title}</h3>
          <p className="mb-8 text-primary max-w-[400px] text-center">
            {pageMessage.message}
          </p>
          <Link state="profile.details" buttonVariant="primary">
            {translate('Go to profile')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// Shown on the profile page to a user who holds no role on anything yet, with
// what to do about it. Calls are named, and linked, only where this
// deployment has a calls section to apply through.
const NoRolesMessage = () =>
  isCallsSectionVisible() ? (
    <>
      {translate(
        'You have not been given access to an organization, project or call.',
      )}{' '}
      {translate(
        'Ask an administrator, or {applyLink}.',
        {
          applyLink: (
            <Link
              state="calls-for-proposals-dashboard"
              label={translate('apply to an open call')}
            />
          ),
        },
        formatJsxTemplate,
      )}
    </>
  ) : (
    <>
      {translate(
        'You have not been given access to an organization or project.',
      )}{' '}
      {translate('Ask an administrator.')}
    </>
  );

const PermissionLayout: FC<PropsWithChildren> = ({ children }) => {
  const {
    permission,
    setPermission,
    setBanner,
    pageMessage,
    setPageMessage,
    clearPermissionView,
  } = useContext(PermissionContext);

  const user = useUser();
  const hasAllAccess = user?.is_staff || user?.is_support;
  const project = useProject();
  const customer = useCustomer();
  const { state, params } = useCurrentStateAndParams();

  const [hasPermissionView, setHasPermissionView] = useState(false);

  // Check users permissions
  useEffect(() => {
    if (!hasAllAccess && state.name && user) {
      if (isDescendantOf('project', state)) {
        if (
          // A call manager reads the projects their call allocated; the page
          // renders read-only, as its actions are gated on project roles.
          !isReadOnlyProjectReader(user, project) &&
          !canAccessProjectDashboard(user, params.uuid, project?.customer_uuid)
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
          ) &&
          !user.permissions.find(
            (permission) =>
              permission.scope_type === 'call_organizer' &&
              permission.customer_uuid === params.uuid,
          ) &&
          !user.permissions.find(
            (permission) =>
              permission.scope_type === 'call' &&
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
      } else if (state.name === 'profile.details' && !hasAnyRole(user)) {
        setPermission('limited');
        setBanner({
          title: translate('No roles yet'),
          message: <NoRolesMessage />,
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
