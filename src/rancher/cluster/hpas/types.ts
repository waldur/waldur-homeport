export interface MetricOption {
  label: string;
  value: string;
  unit: string;
  unitDisplay: string;
}

export interface MetricsFormData {
  metric_name: MetricOption;
  target_type: any;
  quantity: number;
}

export interface HPAUpdateFormData extends MetricsFormData {
  name: string;
  description: string;
  min_replicas: number;
  max_replicas: number;
}

export interface HPACreateFormData extends HPAUpdateFormData {
  workload: {
    url: string;
  };
}
