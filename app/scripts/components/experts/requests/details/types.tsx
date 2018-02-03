export interface ExpertContract {
  price: number;
  description: string;
  team_name: string;
  file?: string;
  filename?: string;
}

export interface RequestConfiguration {
  order: string[];
  options: {};
}
