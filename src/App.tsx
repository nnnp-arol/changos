import React, { useState } from "react";
import { Button } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, getTasks, updateTask, deleteTask } from "./api/task.api";
import { CustomDialog } from "./components/CustomDialog";
import gitIcon from "./assets/icons/icons8-git.svg";
import jiraIcon from "./assets/icons/icons8-jira.svg";
import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useSnackbar } from "notistack";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import { Task } from "./utils/interfaces";

type labelsType = {
  title: string;
  size: string;
};

const labels: labelsType[] = [
  { title: "done", size: "w-2/12" },
  { title: "ticket", size: "w-2/6" },
  { title: "type", size: "w-2/12" },
  { title: "dev", size: "w-2/12" },
  { title: "description", size: "w-1/2" },
  { title: "enviroment", size: "w-2/6" },
  { title: "sprint", size: "w-2/6" },
  { title: "actions", size: "w-2/6" },
];
const taskInit = {
  ticket: "",
  type: "BG",
  description: "",
  done: false,
  enviroment: "develop",
  dev: "jean",
  jira: "",
  sprint: "",
};

function App() {
  const [taskModal, setTaskModal] = useState<boolean>(false);
  const [copyModal, setCopyModal] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [task, setTask] = useState<Task>(taskInit);
  const [branch, setBranch] = useState<string>("");
  const [orderBy, setOrderBy] = useState<string>("ticket");
  const [clickedTask, setClickedTask] = useState<Task | "">("");

  const queryClient = useQueryClient();
  const snackBar = useSnackbar();

  const { data } = useQuery({ queryKey: ["getTasks"], queryFn: getTasks });
  const { mutate: addTask } = useMutation(createTask, {
    onSuccess: () => {
      setTask(taskInit);
      queryClient.invalidateQueries(["getTasks"]);
      snackBar.enqueueSnackbar("Task created successfully", {
        variant: "success",
      });
    },
  });
  const { mutate: editTask } = useMutation(updateTask, {
    onSuccess: () => {
      setTask(taskInit);
      queryClient.invalidateQueries(["getTasks"]);
      return snackBar.enqueueSnackbar("Task updated successfully", {
        variant: "success",
      });
    },
    onError: () => {
      return;
    },
  });
  const { mutate: removeTask } = useMutation(deleteTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(["getTasks"]);
      return snackBar.enqueueSnackbar("Task deleted successfully", {
        variant: "success",
      });
    },
    onError: () => {
      return;
    },
  });

  const openTask = (item: Task) => {
    setClickedTask(item);
    setEditMode(true);
    setTask({
      ticket: item.ticket,
      type: item.type,
      description: item.description,
      done: item.done,
      enviroment: item.enviroment,
      dev: item.dev,
      jira: item.jira,
      sprint: item.sprint,
    });
    setTaskModal(true);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setTask({ ...task, [e.currentTarget.name]: e.target.value });
  };

  const Header: (props: { labels: labelsType[] }) => JSX.Element = ({
    labels,
  }) => {
    return (
      <div className="flex w-full bg-slate-950 flex-row px-5 py-3">
        {labels.map((i, index) => {
          if (index < 7) {
            return (
              <div
                key={i.title}
                className={`flex ${i.size} justify-start ${
                  orderBy === i.title ? "text-slate-400" : "text-white"
                } cursor-pointer`}
                onClick={() => setOrderBy(i.title)}
              >
                <p className="">{i.title}</p>
                <ExpandMoreOutlinedIcon color="inherit" />
              </div>
            );
          }
          return (
            <div
              key={i.title}
              className={`flex ${i.size} justify-start text-white
                } `}
            >
              <p className="">{i.title}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const Cell: (props: {
    label: string | JSX.Element;
    size: string;
  }) => JSX.Element = ({ label, size }) => {
    return (
      <div
        className={`flex ${size} overflow-hidden justify-start items-center py-2 text-slate-400`}
      >
        {label}
      </div>
    );
  };

  const Row: (props: { item: Task }) => JSX.Element = ({ item }) => {
    const desc = `${item.description}`.replaceAll(" ", "-");
    const newBranch = `git checkout -b ${item.type}/${
      item.ticket
    }-${desc.replaceAll(",", "")}`;
    return (
      <div
        className="flex border-b justify-center flex-row h-10 px-5 py-2"
        key={item.description}
        onDoubleClick={() => {
          openTask(item);
        }}
      >
        <Cell
          label={<input type="checkbox" checked={item.done} readOnly />}
          size="w-2/12"
        />
        <Cell label={item.ticket} size="w-2/6" />
        <Cell label={item.type} size="w-2/12" />
        <Cell label={item.dev} size="w-2/12" />
        <Cell
          label={item.description.substring(0, 30).concat("..")}
          size="w-1/2"
        />
        <Cell label={item.enviroment} size="w-2/6" />
        <Cell label={item.sprint} size="w-2/6" />

        <div className="flex w-2/6 flex-row gap-5 text-slate-300 items-center justify-start">
          <button
            className="h-6 w-6"
            onClick={() => {
              setBranch(newBranch);
              setCopyModal(true);
            }}
          >
            <img src={gitIcon} />
          </button>
          <a href={item.jira} target="_blank">
            <img src={jiraIcon} className="h-5 w-5" />
          </a>
          <button
            className="w-7 h-7"
            onClick={() => {
              if (item && item._id) {
                removeTask(item._id);
              }
            }}
          >
            <DeleteOutlineOutlinedIcon />
          </button>
        </div>
      </div>
    );
  };

  const modalRow = "flex flex-row w-full justify-between gap-5";

  return (
    <div className="bg-slate-200 flex flex-1 h-screen justify-start flex-col">
      <div className="w-full text-center">
        <h1 className="text-4xl">CHANGOS</h1>
      </div>
      <div className="flex flex-1 bg-slate-600 px-20 flex-col">
        <div className="py-5">
          <Button variant="contained" onClick={() => setTaskModal(true)}>
            create task
          </Button>
        </div>
        <Header labels={labels} />
        <div className="flex flex-col h-full bg-slate-900">
          {data &&
            data
              .sort((a: any, b: any) => {
                const itemA = a[orderBy];
                const itemB = b[orderBy];
                if (itemA < itemB) {
                  return -1;
                }
                if (itemA > itemB) {
                  return 1;
                }
                return 0;
              })
              .map((i: Task) => <Row item={i} key={i._id} />)}
        </div>
      </div>
      <CustomDialog
        title="New Task"
        open={taskModal}
        handleClose={() => {
          setTaskModal(false);
          setTask(taskInit);
          setEditMode(false);
        }}
        onConfirm={() => {
          if (editMode) {
            const obj = { id: !!clickedTask && clickedTask._id, task: task };
            setTaskModal(false);
            setEditMode(false);
            return editTask(obj);
          }
          addTask(task);
          setTaskModal(false);
        }}
        titleConfirm="Save"
        titleCancel="Cancel"
      >
        <div className="flex flex-1 flex-col gap-3">
          <div className={modalRow}>
            <p>sprint</p>
            <input
              name="sprint"
              type="text"
              className="border"
              value={task.sprint}
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div className={modalRow}>
            <p>ticket</p>
            <input
              name="ticket"
              type="text"
              className="border"
              value={task.ticket}
              onChange={(e) => handleChange(e)}
            />
          </div>

          <div className={modalRow}>
            <p>jira</p>
            <input
              name="jira"
              type="text"
              className="border"
              value={task.jira}
              onChange={(e) => handleChange(e)}
            />
          </div>

          <div className={modalRow}>
            <p>enviroment</p>
            <select
              name="enviroment"
              className="w-2/4 border"
              value={task.enviroment}
              onChange={(e) => handleChange(e)}
            >
              <option value="develop">develop</option>
              <option value="test">test</option>
              <option value="stage">stage</option>
              <option value="production">production</option>
            </select>
          </div>
          <div className={modalRow}>
            <p>type</p>
            <select
              name="type"
              className="w-2/4 border"
              value={task.type}
              onChange={(e) => handleChange(e)}
            >
              <option value="BG">bug</option>
              <option value="FT">feature</option>
              <option value="HF">hot fix</option>
            </select>
          </div>
          <div className={modalRow}>
            <p>dev</p>
            <select
              name="dev"
              className="w-2/4 border"
              value={task.dev}
              onChange={(e) => handleChange(e)}
            >
              <option value="jean">jean</option>
              <option value="arol">arol</option>
              <option value="agu">agu</option>
            </select>
          </div>
          <div className="flex w-full flex-col gap-2">
            <p>description</p>
            <textarea
              name="description"
              cols={30}
              rows={5}
              className="border"
              value={task.description}
              onChange={(e) => handleChange(e)}
            ></textarea>
          </div>

          <div className="flex w-full justify-end gap-5">
            <p>done</p>
            <input
              name="done"
              type="checkbox"
              checked={task.done}
              onChange={() =>
                setTask((prev) => {
                  return { ...prev, done: !task.done };
                })
              }
            />
          </div>
        </div>
      </CustomDialog>
      <CustomDialog
        title="create new branch"
        open={copyModal}
        titleConfirm="Save"
        titleCancel="Cancel"
        withBtns={false}
      >
        <div className="flex flex-row">
          <input
            type="text"
            className="border w-96 border-black pl-2"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          />
          <CopyToClipboard
            text={"lalala"}
            onCopy={() => {
              snackBar.enqueueSnackbar("Copied!", { variant: "success" });
              setCopyModal(false);
            }}
          >
            <Button color="inherit" variant="outlined">
              <ContentPasteGoIcon />
            </Button>
          </CopyToClipboard>
        </div>
      </CustomDialog>
    </div>
  );
}

export default App;
