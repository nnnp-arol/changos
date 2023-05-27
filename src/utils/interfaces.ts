export interface Task {
  _id?: string;
  sprint?: string;
  ticket: string;
  jira?: string;
  jira_state?: string;
  enviroment?: string;
  type?: string;
  app?: string;
  dev?: string;
  description?: string;
  done?: boolean;
}
