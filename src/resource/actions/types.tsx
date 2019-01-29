import { Omit } from 'react-redux';

import { BaseResource } from '@waldur/resource/types';
import { User } from '@waldur/workspace/types';

interface BaseField<Resource> {
  name: string;
  label?: string;
  type?: string;
  required?: boolean;
  component?: string;
  placeholder?: string;
  init?: (field, resource: Resource, form?: any, action?: any) => void;
  default_value?: any;
  resource_default_value?: boolean;
  help_text?: string;
  formGroupClass?: string;
}

interface SelectOption {
  value: string;
  display_name: string;
}

interface SelectField<Resource> extends BaseField<Resource> {
  serializer?: (items: any[]) => any[];
  formatter?: ($filter, item) => string;
  modelParser?: (field, items) => any[];
  display_name_field?: string;
  value_field?: string;
  url?: string;
  choices?: SelectOption[];
}

interface TextField<Resource> extends BaseField<Resource> {
  type: 'string' | 'text';
  pattern?: string;
  maxlength: number;
}

interface IntegerField<Resource> extends BaseField<Resource> {
  type: 'integer';
  min_value?: number;
  max_value?: number;
}

interface ComponentField<Resource> extends Omit<BaseField<Resource>, 'type'> {
  component: string;
}

export type ActionField<Resource = BaseResource> =
  | BaseField<Resource>
  | TextField<Resource>
  | SelectField<Resource>
  | IntegerField<Resource>
  | ComponentField<Resource>
;

type ActionType = 'button' | 'form' | 'callback';

type ActionMethod = 'POST' | 'PUT' | 'DELETE';

type ActionValidator<Resource> = (ctx: ActionContext<Resource>) => string;

export interface ResourceAction<Resource = BaseResource> {
  name: string;
  title: string;
  dialogTitle?: string;
  dialogSubtitle?: string;
  tab?: string;
  iconClass?: string;
  fields?: Array<ActionField<Resource>>;
  type: ActionType;
  successMessage?: string;
  onSuccess?: () => void;
  method?: ActionMethod;
  destructive?: boolean;
  validators?: Array<ActionValidator<Resource>>;
  dialogSize?: 'lg';
  component?: string;
  useResolve?: boolean;
  isVisible?: boolean;
  init?(resource, form, action): void;
  serializer?(form): object;
  execute?(resource): void;
}

export interface ActionContext<Resource = BaseResource> {
  resource: Resource;
  user: User;
}
