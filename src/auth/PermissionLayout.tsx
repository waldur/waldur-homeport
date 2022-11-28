import { useCurrentStateAndParams } from '@uirouter/react';
import React, { useEffect, createContext, useContext, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { Gen048 } from '@waldur/core/svg/Gen048';
import { translate } from '@waldur/i18n';
import {
  getCustomer,
  getProject,
  getUserCustomerPermissions,
  getUserProjectPermissions,
  isStaff,
} from '@waldur/workspace/selectors';

type Permission = 'allowed' | 'limited' | 'restricted';
interface PermissionMessage {
  title: string;
  message: string;
}

export interface PermissionContextInterface {
  permission: Permission;
  setPermission: (value: Permission) => void;
  banner: PermissionMessage;
  setBanner: (value: PermissionMessage) => void;
  pageMessage: PermissionMessage;
  setPageMessage: (value: PermissionMessage) => void;
  clearPermissionView: () => void;
}
interface PermissionViewProps {
  permission: Permission;
  banner?: PermissionMessage;
  pageMessage?: PermissionMessage;
}

export const PermissionContext = createContext<
  Partial<PermissionContextInterface>
>({});

const PermissionDataProvider: React.FC = ({ children }) => {
  const [permission, setPermission] = useState<Permission>('allowed');
  const [banner, setBanner] = useState<PermissionMessage>({
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
          <Gen048 className="svg-icon mb-6 svg-icon-5x svg-icon-danger" />
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

const PermissionLayout: React.FC = ({ children }) => {
  const {
    permission,
    setPermission,
    setBanner,
    setPageMessage,
    clearPermissionView,
  } = useContext(PermissionContext);

  const hasAllAccess = useSelector(isStaff);
  const projectPermissions = useSelector(getUserProjectPermissions);
  const customerPermissions = useSelector(getUserCustomerPermissions);
  const project = useSelector(getProject);
  const customer = useSelector(getCustomer);
  const { state, params } = useCurrentStateAndParams();

  // Check users permissions
  useEffect(() => {
    if (!hasAllAccess && state.name) {
      if (state.name.startsWith('project.') || state.parent === 'project') {
        if (
          !projectPermissions.find((item) => item.project_uuid === params.uuid)
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
        }
      } else if (
        state.name.startsWith('organization.') ||
        state.parent === 'organization'
      ) {
        if (
          !customerPermissions.find(
            (item) => item.customer_uuid === params.uuid,
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
        }
      } else if (
        customerPermissions.length === 0 &&
        projectPermissions.length === 0 &&
        state.name === 'profile.details'
      ) {
        setPermission('limited');
        setBanner({
          title: translate('No association'),
          message: translate(
            'Your account is not part of any organization. Your view will be restricted.',
          ),
        });
      }
    }
    return () => {
      if (permission !== 'allowed') {
        clearPermissionView();
      }
    };
  }, [
    state,
    params,
    projectPermissions,
    customerPermissions,
    project,
    customer,
  ]);

  return permission === 'restricted' ? <RestrictedView /> : <>{children}</>;
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
