import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { compose, createStore, combineReducers } from 'redux';
import { reducer as formReducer, SubmissionError } from 'redux-form';

import reduxForm from 'redux-form/lib/reduxForm';

export const withTestStore = store => WrappedComponent => (
  <Provider store={store}>
    <WrappedComponent/>
  </Provider>
);

export const withReduxForm = WrappedComponent => {
  const reducer = combineReducers({form: formReducer});
  const store = createStore(reducer);
  return withTestStore(store)(WrappedComponent);
};

export const withTestForm = WrappedComponent => reduxForm({form: 'testForm'})(WrappedComponent);

export const mountTestForm = compose(mount, withReduxForm, withTestForm);

export const errorOnSubmit = error => {
  const formError = new SubmissionError(error);
  let onSubmit;
  const promise = new Promise(resolve => {
    onSubmit = () => {
      resolve();
      throw formError;
    };
  });
  return {onSubmit, promise};
};
