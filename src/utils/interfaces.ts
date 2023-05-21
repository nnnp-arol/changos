export interface Task {
  _id?: string;
  ticket: string;
  type: string;
  description: string;
  done: boolean;
  enviroment: string;
  dev: string;
  jira: string;
  sprint: string;
}
