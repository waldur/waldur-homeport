import store from '@waldur/store/store';
import { loginSaml2 } from './store/actions';

export default class Saml2Service {
  login(url) {
    store.dispatch({
      type: loginSaml2.REQUEST,
      payload: {
        'identity-provider': { url }
      }
    });
  }
}
