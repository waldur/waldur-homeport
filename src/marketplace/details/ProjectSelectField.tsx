import * as React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { Field, change, FormAction } from 'redux-form';

import { setCurrentProject } from '@waldur/workspace/actions';
import { Project } from '@waldur/workspace/types';

const PureProjectSelectField = props => (
  <Field
    name="project"
    component={fieldProps => (
      <Select
        value={fieldProps.input.value}
        onChange={value => {
          fieldProps.input.onChange(value);
          props.setCurrentProject(value);
        }}
        labelKey="name"
        valueKey="url"
        options={props.projects}
        clearable={false}
      />
    )}
  />
);

const mapDispatchToProps = {
  setCurrentProject,
  change,
};

const connector = connect<
  {},
  {
    setCurrentProject(project: Project): void;
    change(form: string, field: string, value: any): FormAction;
  },
  { projects: Project[] }
>(undefined, mapDispatchToProps);

export const ProjectSelectField = connector(PureProjectSelectField);
