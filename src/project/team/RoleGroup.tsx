import * as React from 'react';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { Field } from 'redux-form';

import { ENV } from '@waldur/core/services';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';

export const RoleGroup = ({ isProjectManager }) =>
  isProjectManager ? (
    <FormGroup>
      <FormControl.Static>
        <strong>{translate('Role')}</strong>: {translate(ENV.roles.manager)}
      </FormControl.Static>
    </FormGroup>
  ) : (
    <>
      <FormGroup>
        <label>
          <Field name="role" component="input" type="radio" value="manager" />{' '}
          {translate(ENV.roles.manager)}
        </label>
      </FormGroup>
      <FormGroup>
        <label>
          <Field name="role" component="input" type="radio" value="admin" />{' '}
          {translate(ENV.roles.admin)}
        </label>
      </FormGroup>
      {isFeatureVisible('project.support') && (
        <FormGroup>
          <label>
            <Field name="role" component="input" type="radio" value="member" />{' '}
            {translate(ENV.roles.member)}
          </label>
        </FormGroup>
      )}
    </>
  );
