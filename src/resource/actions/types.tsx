import { ComponentType } from 'react';
import { Omit } from 'react-redux';

import { BaseResource } from '@waldur/resource/types';
import { User } from '@waldur/workspace/types';

interface BaseField<Resource> {
  name: string;
  label?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  init?: (field, resource: Resource, form?: any, action?: any) => void;
  default_value?: any;
  resource_default_value?: boolean;
  help_text?: string;
  formGroupClass?: string;
}

interface TextField<Resource> extends BaseField<Resource> {
  type: 'string' | 'text';
  pattern?: string | RegExp;
  maxlength: number;
}

interface IntegerField<Resource> extends BaseField<Resource> {
  type: 'integer';
  minValue?: number;
  maxValue?: number;
}

interface ComponentField<Resource> extends Omit<BaseField<Resource>, 'type'> {
  component: string | React.ComponentType<any>;
}

export type ActionField<Resource = BaseResource> =
  | BaseField<Resource>
  | TextField<Resource>
  | IntegerField<Resource>
  | ComponentField<Resource>;

export type ActionValidator<Resource> = (
  ctx: ActionContext<Resource>,
) => string;

export interface ActionContext<Resource = BaseResource> {
  resource: Resource;
  user: User;
}

export type ActionItemType = ComponentType<{
  resource;
  refetch?(): void;
  as?: ComponentType;
}>;

export type ActionDialogProps = {
  resolve: { resource; refetch };
};
