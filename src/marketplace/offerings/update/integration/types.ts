import React from 'react';

import { FormTableItemProps } from '@waldur/form/FormTable';
import { Offering } from '@waldur/marketplace/types';

export interface ScriptEditorProps {
  offering;
  type;
  dry_run;
  label;
  refetch;
}

export interface ProviderConfig {
  name: string;
  type: string;
  component: React.ComponentType<OfferingEditPanelFormProps>;
  endpoint: string;
  icon: string;
}

export interface EditOfferingProps
  extends Partial<Omit<FormTableItemProps, 'actions'>> {
  title?: string;
  scope: any;
  name: string;
  callback(formData, dispatch): Promise<any>;
  fieldComponent: React.ComponentType;
  hideLabel?: boolean;
  fieldProps?: Record<string, any>;
}

export interface OfferingEditPanelProps {
  offering: Offering;
  refetch(): Promise<any>;
  loading?: boolean;
}

export interface OfferingEditPanelFormProps {
  offering: Offering;
  callback(formData, dispatch): Promise<any>;
  title?: string;
}
