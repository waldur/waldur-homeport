import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { compose, createStore, combineReducers } from 'redux';
import {
  reducer as formReducer,
  SubmissionError,
  reduxForm,
  change,
  getFormValues,
} from 'redux-form';

export const withTestStore = store => WrappedComponent => (
  <Provider store={store}>
    <WrappedComponent />
  </Provider>
);

export const withReduxForm = WrappedComponent => {
  const reducer = combineReducers({ form: formReducer });
  const store = createStore(reducer);
  return withTestStore(store)(WrappedComponent);
};

export const withTestForm = WrappedComponent =>
  reduxForm({ form: 'testForm' })(WrappedComponent);

export const mountTestForm: (
  component: React.ComponentType,
) => ReactWrapper = compose(mount, withReduxForm, withTestForm);

export const errorOnSubmit = error => {
  const formError = new SubmissionError(error);
  let onSubmit;
  const promise = new Promise(resolve => {
    onSubmit = () => {
      resolve();
      throw formError;
    };
  });
  return { onSubmit, promise };
};

export const setFieldValue = (wrapper, field, value) =>
  wrapper.props().store.dispatch(change('testForm', field, value));

export const getTestFormValues = wrapper =>
  getFormValues('testForm')(wrapper.props().store.getState());
