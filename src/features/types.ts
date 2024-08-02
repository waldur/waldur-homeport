interface FeatureItem {
  key: string;
  description: string;
}

export interface FeatureSection {
  key: string;
  description: string;
  items: FeatureItem[];
}
