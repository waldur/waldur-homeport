export interface Product {
  rating: number;
  thumb: string;
  title: string;
  subtitle: string;
  installs: number;
}

export interface ProductDetails extends Product {
  thumb: string;
}

export interface Feature {
  title: string;
  key: string;
}

export interface Section {
  title: string;
  features: Feature[];
}
