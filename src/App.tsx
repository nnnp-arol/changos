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
import { profiles } from "./utils/profiles";

type labelsType = {
  title: string;
  size: string;
};

const labels: labelsType[] = [
  { title: "done", size: "w-2/12" },
  { title: "ticket", size: "w-2/6" },
  { title: "type", size: "w-2/12" },
  { title: "dev", size: "w-2/12" },
  { title: "description", size: "w-1/3" },
  { title: "jira_state", size: "w-1/3" },
  { title: "enviroment", size: "w-2/6" },
  { title: "sprint", size: "w-2/6" },
  { title: "actions", size: "w-2/6" },
];

const taskInit = {
  sprint: "",
  ticket: "",
  jira: "",
  jira_state: "in progress",
  enviroment: "develop",
  app: "app",
  type: "BG",
  description: "",
  done: false,
  dev: "",
};

const userInit = { user: "", password: "", img: "" };

function App() {
  const [taskModal, setTaskModal] = useState<boolean>(false);
  const [copyModal, setCopyModal] = useState<boolean>(false);
  const [confirmDialog, setConfirmDialog] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [login, setLogin] = useState<boolean>(false);

  const [branch, setBranch] = useState<string>("");
  const [orderBy, setOrderBy] = useState<string>("ticket");

  const [clickedTask, setClickedTask] = useState<Task | "">("");
  const [devFilter, setDevFilter] = useState(["jean", "arol", "agu"]);
  const [task, setTask] = useState<Task>(taskInit);
  const [currentItemClicked, setCurrentItemClicked] = useState<string>("");
  const [user, setUser] = useState(userInit);
  const [loggedUser, setLoggedUser] = useState(userInit);

  const queryClient = useQueryClient();

  const snackBar = useSnackbar();

  const { data } = useQuery({
    queryKey: ["getTasks"],
    queryFn: getTasks,
  });

  const { mutate: addTask } = useMutation(createTask, {
    onSuccess: () => {
      setTask(taskInit);
      queryClient.invalidateQueries(["getTasks"]);
      snackBar.enqueueSnackbar("Task created successfully", {
        variant: "success",
      });
    },
    onError: () => {
      snackBar.enqueueSnackbar("There was a problem", {
        variant: "error",
      });
    },
  });
  const { mutate: editTask } = useMutation(updateTask, {
    onSuccess: () => {
      setTask(taskInit);
      queryClient.invalidateQueries(["getTasks"]);
      snackBar.enqueueSnackbar("Task updated successfully", {
        variant: "success",
      });
    },
    onError: () => {
      snackBar.enqueueSnackbar("There was a problem", {
        variant: "error",
      });
    },
  });
  const { mutate: removeTask } = useMutation(deleteTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(["getTasks"]);
      snackBar.enqueueSnackbar("Task deleted successfully", {
        variant: "success",
      });
    },
    onError: () => {
      snackBar.enqueueSnackbar("There was a problem", {
        variant: "error",
      });
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

  const handleLogin = () => {
    const foundProfile = profiles.filter((p) => {
      if (user.user === p.user && user.password === p.password) {
        setLogin(true);
        setTask({ ...task, dev: p.user });
        setLoggedUser(p);
        return p;
      }
      return;
    });
    if (!foundProfile.length) {
      return snackBar.enqueueSnackbar(`user or password is wrong`, {
        variant: "error",
      });
    }
    snackBar.enqueueSnackbar(`welcome back ${user.user}`, {
      variant: "default",
    });
    return setUser(userInit);
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
    label: string | JSX.Element | undefined;
    size: string;
  }) => JSX.Element = ({ label, size }) => {
    return (
      <div
        className={`flex ${size} overflow-hidden justify-start items-center py-2 text-slate-300`}
      >
        {label}
      </div>
    );
  };

  const Row: (props: { item: Task }) => JSX.Element | null = ({ item }) => {
    const dev = item.dev ? item.dev : "";
    const desc = `${item.description}`.replaceAll(" ", "-");
    const newBranch = `git checkout -b ${item.type}/${
      item.ticket
    }-${desc.replaceAll(",", "")}`;

    if (!devFilter.includes(dev)) {
      return null;
    }

    return (
      <div
        className={`bg-slate-800 flex border-b border-opacity-10 border-slate-200 justify-center flex-row h-10 px-5 py-2 cursor-pointer ${
          item.enviroment === "production" ? "opacity-20" : null
        }`}
        key={item.description}
        onDoubleClick={() => {
          if (!login) {
            return snackBar.enqueueSnackbar("you must first log in", {
              variant: "error",
            });
          }
          if (item.dev !== loggedUser.user) {
            return snackBar.enqueueSnackbar("This task is not yours", {
              variant: "error",
            });
          }
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
          label={item.description?.substring(0, 30).concat("..")}
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
              if (!login) {
                return snackBar.enqueueSnackbar("you must first log in", {
                  variant: "error",
                });
              }
              if (item && item._id) {
                setCurrentItemClicked(item._id);
                setConfirmDialog(true);
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
    <div className="bg-slate-950 flex flex-1 h-screen justify-start flex-col overflow-y-hidden">
      <div className="flex w-full text-center  justify-center items-center">
        <div className="flex flex-1 justify-center">
          <h1 className="text-4xl text-white">CHANGOS</h1>
        </div>
        <div className="flex flex-row gap-5 p-4">
          {!login ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                className="border pl-2 bg-slate-950 text-white"
                placeholder="user"
                value={user.user}
                onChange={(e) =>
                  setUser((prev) => {
                    return { ...prev, user: e.target.value };
                  })
                }
              />
              <input
                type="password"
                className="border pl-2 bg-slate-950 text-white"
                placeholder="password"
                value={user.password}
                onChange={(e) =>
                  setUser((prev) => {
                    return { ...prev, password: e.target.value };
                  })
                }
              />
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => {
                  handleLogin();
                }}
              >
                login
              </Button>
            </div>
          ) : (
            <div className="py-2 px-14">
              <img src={loggedUser.img} className="w-20 h-20 rounded-full" />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-1 bg-slate-600 px-20 flex-col">
        <div className="py-5 flex justify-between">
          <div className="flex h-full justify-center items-end">
            <Button
              variant="contained"
              onClick={() => setTaskModal(true)}
              disabled={!login}
            >
              create task
            </Button>
          </div>
          <div className="flex flex-row gap-5 border px-5 py-2 border-black border-opacity-20">
            <div className="flex flex-row gap-2 justify-center items-center">
              <input
                name="jean"
                type="checkbox"
                checked={devFilter.includes("jean")}
                onChange={() => {
                  if (devFilter.includes("jean")) {
                    return setDevFilter(devFilter.filter((i) => i !== "jean"));
                  }
                  return setDevFilter([...devFilter, "jean"]);
                }}
              />
              <p>jean</p>
            </div>
            <div className="flex flex-row gap-2 justify-center items-center">
              <input
                name="arol"
                type="checkbox"
                checked={devFilter.includes("arol")}
                onChange={() => {
                  if (devFilter.includes("arol")) {
                    return setDevFilter(devFilter.filter((i) => i !== "arol"));
                  }
                  return setDevFilter([...devFilter, "arol"]);
                }}
              />
              <p>arol</p>
            </div>
            <div className="flex flex-row gap-2 justify-center items-center">
              <input
                name="agu"
                type="checkbox"
                checked={devFilter.includes("agu")}
                onChange={() => {
                  if (devFilter.includes("agu")) {
                    return setDevFilter(devFilter.filter((i) => i !== "agu"));
                  }
                  return setDevFilter([...devFilter, "agu"]);
                }}
              />
              <p>agu</p>
            </div>
          </div>
        </div>

        <Header labels={labels} />
        <div className="flex flex-col h-3/4 bg-slate-900 overflow-y-auto">
          {data
            ? data
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
                .map((i: Task) => <Row item={i} key={i._id} />)
            : null}
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
          setTask({ ...task, dev: loggedUser.user });
          if (editMode) {
            const obj = { id: !!clickedTask && clickedTask._id, task: task };
            setEditMode(false);
            editTask(obj);
            return setTaskModal(false);
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
            <p>jira url</p>
            <input
              name="jira"
              type="text"
              className="border"
              value={task.jira}
              onChange={(e) => handleChange(e)}
            />
          </div>

          <div className={modalRow}>
            <p>jira state</p>
            <select
              name="jira_state"
              className="w-2/4 border"
              value={task.jira_state}
              onChange={(e) => handleChange(e)}
            >
              <option value="review information">review information</option>
              <option value="needs revision">needs revision</option>
              <option value="in progress">in progress</option>
              <option value="ready to test">ready to test</option>
              <option value="in testing">in testing</option>
              <option value="approved and tested">approved and tested</option>
              <option value="deployed to stage">deployed to stage</option>
              <option value="release candidate">release candidate</option>
            </select>
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

          <div className="flex flex-row justify-between mt-2 ">
            <p>application</p>
            <div className="flex flex-row gap-5 border w-1/2 justify-end">
              <div className="flex flex-row gap-2">
                <p>app</p>
                <input
                  name="app"
                  type="checkbox"
                  checked={task.app === "app"}
                  onChange={() => {
                    const res = task.app === "app" ? "web" : "app";
                    setTask((prev) => {
                      return { ...prev, app: res };
                    });
                  }}
                />
              </div>
              <div className="flex flex-row gap-2">
                <p>web</p>
                <input
                  name="web"
                  type="checkbox"
                  checked={task.app === "web"}
                  onChange={() => {
                    const res = task.app === "app" ? "web" : "app";
                    setTask((prev) => {
                      return { ...prev, app: res };
                    });
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            <p>description</p>
            <textarea
              name="description"
              cols={30}
              rows={3}
              className="border"
              value={task.description}
              onChange={(e) => handleChange(e)}
            ></textarea>
          </div>

          <div className="flex w-full justify-end gap-2">
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
            text={branch}
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
      <CustomDialog
        title="Are you sure you want to delete?"
        open={confirmDialog}
        titleConfirm="Yes"
        titleCancel="No"
        handleClose={() => setConfirmDialog(false)}
        onConfirm={() => {
          removeTask(currentItemClicked);
          setConfirmDialog(false);
        }}
      >
        <div></div>
      </CustomDialog>
    </div>
  );
}

export default App;
