import React from 'react';

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
  component: React.ComponentType;
  endpoint: string;
  icon: string;
  serializer: (details: any) => any;
}
