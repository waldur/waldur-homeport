/** Map of component type to component info from offering */
export type ComponentMap = Record<
  string,
  {
    type: string;
    name: string;
    measured_unit?: string;
  }
>;
