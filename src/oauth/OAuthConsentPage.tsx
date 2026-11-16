import {
  CheckCircleIcon,
  EyeSlashIcon,
  WarningCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, ReactNode, useEffect, useMemo, useRef } from 'react';
import {
  ConsentDetails,
  oauthConsent,
  oauthConsentRetrieve,
  OauthConsentRetrieveData,
  User,
} from 'waldur-js-client';

import {
  AlertItem,
  BaseButton,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  PropertyItem,
  PropertyList,
} from 'waldur-ui';

import { getHeaders } from '@/core/api';
import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { RedirectStorage } from '@/core/StorageManager';
import { getErrorStatus } from '@/error/utils';
import { formatJsx, formatJsxTemplate, translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { useTitle } from '@/navigation/title';
import { propVal } from '@/property/propertyFields';
import { useNotify } from '@/store/notify';
import { isImpersonating } from '@/user/termsGate';
import { clearImpersonationData, UsersService } from '@/user/UsersService';
import { useUser } from '@/workspace/hooks';

import { ConsentPageLayout } from './ConsentPageLayout';

type ConsentRequest = OauthConsentRetrieveData['query'];

const REQUEST_PARAMS = [
  'client_id',
  'redirect_uri',
  'response_type',
  'scope',
  'state',
  'code_challenge',
  'code_challenge_method',
  'resource',
] as const;

/** The authorization request as the client sent it, leaving out what it didn't send. */
export const getConsentRequest = (
  params: Record<string, unknown>,
): ConsentRequest =>
  Object.fromEntries(
    REQUEST_PARAMS.filter((key) => params[key] != null).map((key) => [
      key,
      params[key],
    ]),
  ) as ConsentRequest;

type Refusal =
  | {
      reason: 'invalid';
      /** The OAuth error code, such as invalid_scope. */
      error?: string;
      description?: string;
    }
  /** Apps may not connect: MCP is off, or the backend has no consent API. */
  | { reason: 'disabled' }
  | { reason: 'impersonating' }
  | { reason: 'not-own-sign-in' };

/** A 400, 403 or 404 is final for this request; anything else may pass on retry. */
export const getRefusal = (error: unknown): Refusal | undefined => {
  switch (getErrorStatus(error)) {
    case 400: {
      const data = (
        error as { data?: { error?: string; error_description?: string } }
      )?.data;
      return {
        reason: 'invalid',
        error: data?.error,
        description: data?.error_description || undefined,
      };
    }
    case 403:
      return isImpersonating()
        ? { reason: 'impersonating' }
        : { reason: 'not-own-sign-in' };
    case 404:
      return { reason: 'disabled' };
    default:
      return undefined;
  }
};

/** The title and advice for a request the backend refused, by its OAuth error code. */
const describeInvalidRequest = (error?: string) => {
  switch (error) {
    case 'invalid_scope':
      return {
        title: translate('This app asks for access Waldur does not offer'),
        advice: translate(
          'Update the app or check its settings, then connect it again.',
        ),
      };
    case 'invalid_target':
      return {
        title: translate('This app is set up for another server'),
        advice: translate(
          "Check the Waldur address in the app's settings, then connect it again. If the address is right, contact your Waldur administrator.",
        ),
      };
    case 'unauthorized_client':
    case 'unsupported_response_type':
      return {
        title: translate('This app cannot connect to Waldur this way'),
        advice: translate('Update the app, or contact whoever provides it.'),
      };
    case 'server_error':
    case 'temporarily_unavailable':
      return {
        title: translate('Waldur could not complete this request'),
        advice: translate(
          'Go back to the app and connect it again. If it keeps failing, contact your Waldur administrator.',
        ),
      };
    default:
      return {
        title: translate('This sign-in request cannot be used'),
        advice: translate('Go back to the app and connect it again.'),
        // Some errors come without a description; the code still says what failed.
        fallback: error,
      };
  }
};

/** The scope an app needs before it can work for a staff or support account. */
const ROLE_SCOPES = {
  staff: 'mcp:staff',
  support: 'mcp:support',
} as const;

/** Only for staff and support: a regular user's token never exceeds their own access. */
const ElevatedAccessNotice: FC<{ details: ConsentDetails }> = ({ details }) => {
  const role = details.elevated_access;
  if (!role) {
    return null;
  }
  if (details.scopes.some((scope) => scope.name === ROLE_SCOPES[role])) {
    return (
      <AlertItem
        type="floating"
        variant="warning"
        title={
          role === 'staff'
            ? translate('This app asks for staff access')
            : translate('This app asks for support access')
        }
        body={
          role === 'staff'
            ? translate(
                'It will be able to do what your staff account can do anywhere in this portal, not only in your own organizations and projects. Allow it only if you trust it with that.',
              )
            : translate(
                'It will be able to see what your support account can see anywhere in this portal, not only in your own organizations and projects. Allow it only if you trust it with that.',
              )
        }
      />
    );
  }
  return (
    <AlertItem
      type="floating"
      variant="info"
      title={translate('This app will not work for your account yet')}
      body={
        role === 'staff'
          ? translate(
              'Your account has staff access, so an app has to ask for staff access before it can work for you. This app did not ask for it.',
            )
          : translate(
              'Your account has support access, so an app has to ask for support access before it can work for you. This app did not ask for it.',
            )
      }
    />
  );
};

const ConsentForm: FC<{
  details: ConsentDetails;
  /** Gone for a moment when the session ends while the page is open. */
  user: User | undefined;
  /** The answer while it is being sent. */
  sending?: boolean;
  onDecide(allow: boolean): void;
}> = ({ details, user, sending, onDecide }) => (
  <Card bordered>
    <CardHeader className="justify-center border-b-0 text-center">
      <CardTitle size="lg" as="h1" className="mr-0 justify-center">
        {/* The title is a flex box, which drops the spaces around <strong>. */}
        <span>
          {translate(
            'Allow {client} to access your account?',
            { client: <strong>{details.client_name}</strong> },
            formatJsxTemplate,
          )}
        </span>
      </CardTitle>
      {details.registration_source === 'dcr' ? (
        // Anyone can register a client under any name, "Claude Code" included.
        <p className="mt-1 mb-0 w-full text-sm font-normal text-tertiary">
          {translate(
            'This app registered itself. Waldur has not checked its name.',
          )}
        </p>
      ) : null}
    </CardHeader>
    <CardContent className="flex flex-col gap-5">
      <PropertyList variant="summary" termWidth="md">
        <PropertyItem
          label={translate('Application')}
          value={details.client_name}
        />
        {details.client_host ? (
          <PropertyItem
            label={translate('Application website')}
            value={details.client_host}
          />
        ) : null}
        <PropertyItem
          label={translate('Sends you back to')}
          value={
            <span className="font-semibold text-primary">
              {details.redirect_host}
            </span>
          }
        />
        <PropertyItem
          label={translate('Signed in as')}
          value={
            user ? (
              <span className="flex flex-wrap gap-x-3">
                {propVal.user(user)?.node}
                {/* The page has no user menu. Logging out also forgets this
                    request, so the user connects the app again. */}
                <Link state="logout" label={translate('Not you? Sign out')} />
              </span>
            ) : null
          }
        />
      </PropertyList>

      <div>
        <p className="mb-2 font-medium text-primary">
          {translate(
            '{client} will be able to:',
            { client: <strong>{details.client_name}</strong> },
            formatJsxTemplate,
          )}
        </p>
        <ul className="flex list-none flex-col gap-1.5 pl-0">
          {details.scopes.map((scope) => (
            <li key={scope.name} className="flex items-start gap-2">
              <CheckCircleIcon
                weight="bold"
                className="mt-0.5 shrink-0 text-success"
                aria-hidden
              />
              <span>{scope.description}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-primary">
        {translate(
          '{client} can act on your behalf with the permissions above.',
          { client: <strong>{details.client_name}</strong> },
          formatJsxTemplate,
        )}{' '}
        {translate(
          'You can disconnect it any time under <Link>Connected apps</Link>.',
          {
            // A new tab, so this request stays open.
            Link: (s) => (
              <Link state="profile-connected-apps" label={s} target="_blank" />
            ),
          },
          formatJsx,
        )}
      </p>

      <ElevatedAccessNotice details={details} />
    </CardContent>
    <CardFooter className="flex gap-3 border-t-0">
      <BaseButton
        variant="tertiary"
        size="lg"
        className="flex-1"
        label={translate('Deny')}
        onClick={() => onDecide(false)}
        disabled={sending !== undefined}
        disabledReason={translate('Your answer is being sent.')}
        pending={sending === false}
      />
      <BaseButton
        variant="primary"
        size="lg"
        className="flex-1"
        label={translate('Allow')}
        onClick={() => onDecide(true)}
        disabled={sending !== undefined}
        disabledReason={translate('Your answer is being sent.')}
        pending={sending === true}
      />
    </CardFooter>
  </Card>
);

/** How long the result stays on screen before the browser goes back to the app. */
export const RETURN_DELAY_MS = 3000;

/**
 * Waldur's own confirmation of the decision. The app gets the code, or the
 * denial, only through the redirect, and a code expires within a minute, so the
 * page goes back by itself.
 */
const DecisionResult: FC<{
  allowed: boolean;
  clientName: string;
  redirectUrl: string;
}> = ({ allowed, clientName, redirectUrl }) => {
  useEffect(() => {
    // Replace, so Back does not return to a request that is already spent.
    const timer = setTimeout(
      () => window.location.replace(redirectUrl),
      RETURN_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [redirectUrl]);

  return (
    <StatusMessage
      icon={
        allowed ? (
          <CheckCircleIcon weight="bold" size={24} />
        ) : (
          <XCircleIcon weight="bold" size={24} />
        )
      }
      title={
        allowed
          ? translate('{client} is connected', { client: clientName })
          : translate('{client} was not connected', { client: clientName })
      }
      message={
        allowed
          ? translate('It can now act on your behalf.')
          : translate('It did not get access to your account.')
      }
      status={translate('Taking you back to {client}…', {
        client: clientName,
      })}
      action={
        <BaseButton
          variant="primary"
          size="lg"
          className="w-full"
          label={translate('Return to {client}', { client: clientName })}
          onClick={() => window.location.replace(redirectUrl)}
        />
      }
    />
  );
};

/** Every outcome of the page, the decision and each refusal, as the app's status view. */
const StatusMessage: FC<{
  icon: ReactNode;
  title: string;
  message: ReactNode;
  status?: ReactNode;
  action?: ReactNode;
}> = ({ icon, title, message, status, action }) => (
  <NoResult
    // A whole page, not an empty table: larger title and text, one full-width action.
    className="overflow-visible! [&_.actions]:max-w-sm [&_.search-icon]:relative [&_.search-icon]:-top-5 [&_svg.background]:-top-5! [&_.search-icon]:mb-6! [&_h4]:mb-3! [&_h4]:text-2xl [&_h4]:leading-8 [&_p]:text-base"
    icon={icon}
    title={title}
    message={
      <>
        <p className="mb-0">{message}</p>
        {status ? (
          <p className="mb-0" role="status">
            {status}
          </p>
        ) : null}
      </>
    }
    actions={action}
    noAction={!action}
  />
);

const RefusalCard: FC<{
  refusal: Refusal;
  onStopImpersonating(): void;
}> = ({ refusal, onStopImpersonating }) => {
  const icon = <WarningCircleIcon weight="bold" size={24} />;
  switch (refusal.reason) {
    case 'invalid': {
      const { title, advice, fallback } = describeInvalidRequest(refusal.error);
      return (
        <StatusMessage
          icon={icon}
          title={title}
          message={[refusal.description ?? fallback, advice]
            .filter(Boolean)
            .join(' ')}
        />
      );
    }
    case 'disabled':
      return (
        <StatusMessage
          icon={icon}
          title={translate('Apps cannot connect to this portal')}
          message={translate(
            'This portal does not let apps connect to Waldur accounts. If you need it, contact your Waldur administrator.',
          )}
        />
      );
    case 'impersonating':
      return (
        <StatusMessage
          icon={icon}
          title={translate('Stop impersonating to approve apps')}
          message={translate(
            'Only the user can let an app act as them. Stop impersonating to answer this request as yourself.',
          )}
          action={
            // The page has no impersonation bar.
            <BaseButton
              variant="primary"
              size="lg"
              className="w-full"
              iconNode={<EyeSlashIcon size={20} weight="bold" />}
              label={translate('Stop impersonating')}
              onClick={onStopImpersonating}
            />
          }
        />
      );
    case 'not-own-sign-in':
      return (
        <StatusMessage
          icon={icon}
          title={translate('Approve apps from your own sign-in')}
          message={translate(
            'Apps cannot be approved with an access token. Sign in to Waldur as yourself and connect the app again.',
          )}
        />
      );
  }
};

/**
 * Where an OAuth client's authorization request lands: the user allows or
 * denies it here, and the backend says where to send the browser next.
 */
export const OAuthConsentPage: FC = () => {
  const { params } = useCurrentStateAndParams();
  const request = useMemo(() => getConsentRequest(params), [params]);
  const user = useUser();
  const { showErrorResponse } = useNotify();
  useTitle(translate('Authorize application'), undefined, 'browser');

  const details = useQuery({
    queryKey: ['oauth-consent', request],
    queryFn: () =>
      oauthConsentRetrieve({ query: request }).then(
        (response) => response.data,
      ),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    // A 404 means apps may not connect, which the page explains itself.
    meta: { handlesErrorStatuses: [404] },
  });

  // A second click lands before the pending state renders.
  const sent = useRef(false);
  const decision = useMutation({
    mutationFn: (allow: boolean) =>
      oauthConsent({ body: { ...request, allow } }).then(
        (response) => response.data,
      ),
    onSuccess: () => {
      // The request is spent, so a later login must not come back to it.
      RedirectStorage.remove();
    },
    onError: (error, allow) => {
      sent.current = false;
      if (!getRefusal(error)) {
        showErrorResponse(
          error,
          allow
            ? translate('Unable to allow access.')
            : translate('Unable to deny access.'),
        );
      }
    },
  });

  const stopImpersonating = useMutation({
    mutationFn: async () => {
      // Clear only after the refresh succeeds, or a failure reads as the token
      // sign-in refusal. getHeaders(false) already drops the impersonation.
      await UsersService.refreshCurrentUser({ headers: getHeaders(false) });
      clearImpersonationData();
      decision.reset();
      await details.refetch();
    },
    onError: (error) =>
      showErrorResponse(error, translate('Unable to stop impersonating.')),
  });

  const decide = (allow: boolean) => {
    if (sent.current) {
      return;
    }
    sent.current = true;
    decision.mutate(allow);
  };

  const refusal = getRefusal(details.error) ?? getRefusal(decision.error);

  let content;
  // isPending, not isLoading: a fetch paused while offline is not an error.
  // While impersonation stops, the old refusal would read as a different one.
  if (details.isPending || stopImpersonating.isPending) {
    content = <LoadingSpinner />;
  } else if (decision.isSuccess && details.data) {
    content = (
      <DecisionResult
        allowed={decision.variables}
        clientName={details.data.client_name}
        // The backend builds the URL; it is never assembled here.
        redirectUrl={decision.data.redirect_url}
      />
    );
  } else if (refusal) {
    content = (
      <RefusalCard
        refusal={refusal}
        onStopImpersonating={() => stopImpersonating.mutate()}
      />
    );
  } else if (details.error || !details.data) {
    content = (
      <LoadingErred
        loadData={() => details.refetch()}
        message={translate('Unable to load the sign-in request.')}
      />
    );
  } else {
    content = (
      <ConsentForm
        details={details.data}
        user={user}
        sending={decision.isPending ? decision.variables : undefined}
        onDecide={decide}
      />
    );
  }

  return <ConsentPageLayout>{content}</ConsentPageLayout>;
};
