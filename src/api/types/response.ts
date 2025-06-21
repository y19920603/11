export interface ErrorItem {
  [key: string]: string;
}

export interface ActionResponse {
  result: boolean;
  msg: string;
  errors: ErrorItem;
}
