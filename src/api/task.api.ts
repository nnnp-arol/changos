import axios from "axios";
import { Task } from "../utils/interfaces";
const http = axios.create({
  baseURL: "https://changos-api.fly.dev",
});

export const getTasks = async () => {
  const data = await http.get("/tasks");
  return data.data;
};

export const createTask = async (newTask: Task) => {
  const createdTask = await http.post("/task", newTask);
  return createdTask;
};

export const updateTask = async (data: any) => {
  const editedTask = await http.put(`/task/${data.id}`, data.task);
  return editedTask;
};

export const deleteTask = async (id: string) => {
  const deletedTask = await http.delete(`/task/${id}`);
  return deletedTask;
};
