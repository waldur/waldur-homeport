import React from 'react';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { FormTableItemProps } from '@waldur/form/FormTable';

export interface ScriptEditorProps {
  offering: ProviderOfferingDetails;
  type: string;
  dry_run: string;
  label: string;
  refetch: () => Promise<any>;
}

export interface ProviderConfig {
  name: string;
  type: string;
  component: React.ComponentType<OfferingEditPanelFormProps>;
  icon: string;
}

export interface EditOfferingProps
  extends Partial<Omit<FormTableItemProps, 'actions'>> {
  title?: string;
  scope: any;
  name: string;
  callback(formData): Promise<any>;
  fieldComponent: React.ComponentType;
  hideLabel?: boolean;
  fieldProps?: Record<string, any>;
}

export interface OfferingEditPanelProps {
  offering: ProviderOfferingDetails;
  refetch(): Promise<any>;
  loading?: boolean;
}

export interface OfferingEditPanelFormProps {
  offering: ProviderOfferingDetails;
  callback(formData): Promise<any>;
  title?: string;
}
