import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';

import { ENV, ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { showError } from '@waldur/store/coreSaga';

const checkRegistrationMethods = async (mode, router, dispatch) => {
  /*
   This method validates invitation token for signup in four steps:

   1) check if invitations are enabled and user tries to signup;

   2) check if user is allowed to signup without invitation token;

   3) check if invitation token is present in local storage;

   4) check if invitation token is valid using REST API.
  */

  if (!ENV.plugins.WALDUR_CORE.INVITATIONS_ENABLED || mode !== 'register') {
    return;
  }

  if (ENV.plugins.WALDUR_CORE.ALLOW_SIGNUP_WITHOUT_INVITATION) {
    return;
  }

  const invitationService = ngInjector.get('invitationService');
  const token = invitationService.getInvitationToken();
  if (!token) {
    dispatch(showError(translate('Invitation token is not found.')));
    router.stateService.go('errorPage.notFound');
    return;
  }

  try {
    const result = await invitationService.check(token);
    if (result.data.civil_number_required) {
      return true;
    }
  } catch (e) {
    dispatch(showError(translate('Unable to validate invitation token.')));
    router.stateService.go('errorPage.notFound');
  }
};

export const useAuthFeatures = () => {
  const { state } = useCurrentStateAndParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { loading, value: civilNumberRequired } = useAsync(
    () => checkRegistrationMethods(state.name, router, dispatch),
    [state.name, router.stateService, dispatch],
  );

  const methods = React.useMemo(
    () =>
      ENV.plugins.WALDUR_CORE.AUTHENTICATION_METHODS.reduce((result, item) => {
        result[item] = true;
        return result;
      }, {}),
    [],
  );

  const showSigninButton = methods.LOCAL_SIGNIN && state.name === 'register';

  const showSigninForm = methods.LOCAL_SIGNIN && state.name === 'login';

  const showSignupButton =
    methods.LOCAL_SIGNUP &&
    state.name === 'login' &&
    (!ENV.plugins.WALDUR_CORE.INVITATIONS_ENABLED ||
      ENV.plugins.WALDUR_CORE.ALLOW_SIGNUP_WITHOUT_INVITATION);

  const showSignupForm =
    methods.LOCAL_SIGNUP && state.name === 'register' && !civilNumberRequired;

  const showSocialSignup = methods.SOCIAL_SIGNUP && !civilNumberRequired;

  const showGoogle =
    showSocialSignup && !!ENV.plugins.WALDUR_AUTH_SOCIAL.GOOGLE_CLIENT_ID;

  const showFacebook =
    showSocialSignup && !!ENV.plugins.WALDUR_AUTH_SOCIAL.FACEBOOK_CLIENT_ID;

  const showSmartId =
    showSocialSignup && !!ENV.plugins.WALDUR_AUTH_SOCIAL.SMARTIDEE_CLIENT_ID;

  const showTARA =
    showSocialSignup && !!ENV.plugins.WALDUR_AUTH_SOCIAL.TARA_CLIENT_ID;

  const showValimo = methods.VALIMO && state.name === 'login';

  const showSaml2 =
    methods.SAML2 && !!ENV.plugins.WALDUR_AUTH_SAML2.IDENTITY_PROVIDER_URL;

  const showSaml2Providers =
    methods.SAML2 &&
    ENV.plugins.WALDUR_AUTH_SAML2.ALLOW_TO_SELECT_IDENTITY_PROVIDER;

  return {
    loading,
    mode: state.name,
    SigninButton: showSigninButton,
    SigninForm: showSigninForm,
    SignupButton: showSignupButton,
    SignupForm: showSignupForm,
    SocialSignup: showSocialSignup,
    google: showGoogle,
    facebook: showFacebook,
    smartid: showSmartId,
    tara: showTARA,
    valimo: showValimo,
    saml2: showSaml2,
    saml2providers: showSaml2Providers,
  };
};
