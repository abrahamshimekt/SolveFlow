import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BasicLayout from "../../Layout/BasicLayout";
import validator from "validator";
import { useDispatch, useSelector } from "react-redux";
import { addProblem } from "../../Redux/Features/addProblemSlice";
import {
  Row,
  Col,
  Button,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import styles from "./Home.module.scss";
import {
  deleteProblemData,
  getAllProblems,
} from "../../Redux/Features/getAllProblemsSlice";
import { formatDateToStandard, getCookie } from "../../utils/helper";
import { updateProblem } from "../../Redux/Features/updateProblemSlice";
import { restartProblem } from "../../Redux/Features/restartProblemSlice";
import { getLibrary } from "../../Redux/Features/getLibrarySlice";
import { deleteProblem } from "../../Redux/Features/deleteProblemSlice";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [problem, setProblem] = useState({
    title: "",
    description: "",
    library: "",
    language: "",
  });
  const [addProblemModal, setAddProblemModal] = useState(false);
  const [editProblemModal, setEditProblemModal] = useState({
    open: false,
    id: "",
    title: "",
    description: "",
    library: "",
    language: "",
  });
  const { isLoading: getAllProblemsLoading } = useSelector(
    (state) => state?.getAllProblems
  );
  const { data: getLibraryData } = useSelector((state) => state?.getLibrary);

  let { data: problemsData } = useSelector((state) => state?.getAllProblems);
  const { isLoading: addProblemLoading } = useSelector(
    (state) => state?.addProblem
  );
  const { isLoading: updateProblemLoading } = useSelector(
    (state) => state?.updateProblem
  );

  let [clientErrors, setClientErrors] = useState({});

  useEffect(() => {
    dispatch(getAllProblems());
    dispatch(getLibrary());
  }, []);

  const saveAsNewProblem = async () => {
    let isErr = false;
    let errors = {};

    if (validator.isEmpty(problem?.title)) {
      isErr = true;
      errors.title = "Title is required";
    }
    if (validator.isEmpty(problem?.description)) {
      isErr = true;
      errors.description = "Description is required";
    }

    if (problem?.steps?.length === 0) {
      isErr = true;
      errors.steps = "Steps is required";
    }

    if (isErr) {
      isErr = false;
      setClientErrors(errors);
    } else {
      isErr = false;
      setClientErrors({});
      dispatch(
        addProblem({
          data: problem,
          onSuccess: () => {
            setProblem({
              title: "",
              description: "",
              library: "",
              language: "",
            });
            dispatch(getAllProblems());
            setAddProblemModal(false);
            setEditProblemModal({
              open: false,
              id: "",
              title: "",
              description: "",
              library: "",
              language: "",
            });
          },
        })
      );
    }
  };

  const handleUpdateProblem = async () => {
    let isErr = false;
    let errors = {};

    if (validator.isEmpty(editProblemModal?.title)) {
      isErr = true;
      errors.title = "Title is required";
    }
    if (validator.isEmpty(editProblemModal?.description)) {
      isErr = true;
      errors.description = "Description is required";
    }

    if (editProblemModal?.steps?.length === 0) {
      isErr = true;
      errors.steps = "Steps is required";
    }

    if (isErr) {
      isErr = false;
      setClientErrors(errors);
    } else {
      isErr = false;
      setClientErrors({});
      dispatch(
        updateProblem({
          data: {
            title: editProblemModal?.title,
            description: editProblemModal?.description,
            steps: editProblemModal?.steps,
            library: editProblemModal?.library,
            language: editProblemModal?.language,
          },
          id: editProblemModal?.id,
          onSuccess: () => {
            dispatch(getAllProblems());
            setEditProblemModal({
              open: false,
              id: "",
              title: "",
              description: "",
              library: "",
              language: "",
            });
          },
        })
      );
    }
  };

  const handleStepsData = (id) => {
    if (getLibraryData?.length > 0) {
      if (id) {
        const step = getLibraryData?.find(
          (item) => item?._id?.toString() === id?.toString()
        );
        const stepKeys = step?.steps?.map((key) => key?.key);
        return `${step?.name} (${stepKeys?.join(", ")})`;
      } else {
        const stepsData = getLibraryData?.map((item, i) => {
          const keyData = item?.steps?.map((key) => key?.key);
          return {
            label: `${item?.name} (${keyData?.join(", ")})`,
            value: item?._id,
          };
        });
        return stepsData;
      }
    }
  };

  const handleDeleteProblem = (id) => {
    dispatch(
      deleteProblem({
        id,
        onSuccess: () => {
          dispatch(deleteProblemData(id));
        },
      })
    );
  };

  const dataSource = problemsData?.map((item, i) => {
    return {
      key: i,
      date: (
        <p className={styles.paragraph1}>
          {formatDateToStandard(item?.created_at)}
        </p>
      ),
      title: <p className={styles.paragraph2}>{item?.title}</p>,
      description: (
        <p className={styles.paragraph3}>
          <Tooltip title={item?.description}>{`${item?.description?.slice(
            0,
            50
          )}${item?.description?.length > 78 ? "..." : ""}`}</Tooltip>
        </p>
      ),
      library: (
        <p className={styles.paragraph3}>
          {handleStepsData(item?.library)?.slice(0, 30) + "  ..."}
        </p>
      ),
      language: <p className={styles.paragraph2}>{item?.language}</p>,

      action: (
        <Space>
          <Button
            style={{ color: "red" }}
            onClick={() => handleDeleteProblem(item?._id)}
          >
            Delete
          </Button>

          {/* Edit Problem */}

          <Button
            type="primary"
            size="small"
            onClick={() => {
              setEditProblemModal({
                open: true,
                id: item?._id,
                title: item?.title,
                description: item?.description,
                library: item?.library,
                language: item?.language,
              });
            }}
          >
            Edit
          </Button>

          {/* Start coversation */}

          {Number(item?.stepCount) === 0 && (
            <Button
              type="primary"
              size="small"
              onClick={() => navigate(`/chat/${item?._id}`)}
            >
              Start
            </Button>
          )}

          {/* restart the conversation */}

          {Number(item?.stepCount) > 0 && (
            <Button
              type="primary"
              size="small"
              onClick={() => {
                dispatch(
                  restartProblem({
                    id: item?._id,
                    onSuccess: () => {
                      navigate(`/chat/${item?._id}`);
                    },
                  })
                );
              }}
            >
              Restart
            </Button>
          )}
           {/* view conversation */}

           {Number(item?.stepCount) > 0 &&
            Number(item?.stepCount) <= Number(item?.maxCount) && (
              <Button
                type="primary"
                size="small"
                onClick={() => navigate(`/chat/${item?._id}`)}
              >
                View
              </Button>
            )}
        </Space>
      ),
    };
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "1",
      // width: 150,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "2",
      // width: 150,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "3",
      // width: 400,
    },
    {
      title: "Library",
      dataIndex: "library",
      key: "4",
      // width: 500,
    },
    {
      title: "Language",
      dataIndex: "language",
      key: "5",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "5",
    },
  ];

  return (
    <BasicLayout>
      <div className={styles.problems_container}>
        <div className={styles.button_container}>
          <Button type="primary" onClick={() => setAddProblemModal(true)}>
            Add Problem
          </Button>
        </div>
        <div className={styles.table_container}>
          <Table
            loading={getAllProblemsLoading}
            dataSource={dataSource}
            columns={columns}
          />
        </div>
      </div>
      <Modal
        centered
        open={addProblemModal}
        okButtonProps={{
          disabled: addProblemLoading,
          loading: addProblemLoading,
        }}
        okText="Save"
        onCancel={() => {
          setProblem({
            title: "",
            description: "",
            library: "",
          });
          setAddProblemModal(false);
        }}
        onOk={saveAsNewProblem}
        footer={[
          <Row key="footer" justify="space-between" align="middle">
            <Col>
              <Input
                placeholder="Language"
                size="small"
                value={problem?.language}
                onChange={(e) =>
                  setProblem({ ...problem, language: e?.target?.value })
                }
              />
            </Col>
            <Col>
              <Button
                onClick={() => {
                  setProblem({
                    title: "",
                    description: "",
                    library: "",
                  });
                  setAddProblemModal(false);
                }}
              >
                Cancel
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                onClick={saveAsNewProblem}
                disabled={addProblemLoading}
              >
                {addProblemLoading ? "Saving..." : "Save"}
              </Button>
            </Col>
          </Row>,
        ]}
      >
        <div className={styles.add_problem_container}>
          <Typography.Title level={3}>Add Problem</Typography.Title>
          <div className={styles.input_container}>
            <Input
              type="text"
              placeholder="Problem Title"
              size="large"
              value={problem?.title}
              onChange={(e) =>
                setProblem({ ...problem, title: e?.target?.value })
              }
            />
            {clientErrors?.title && (
              <span className="error_message">{clientErrors?.title}</span>
            )}
          </div>

          <div className={styles.input_container}>
            <Input.TextArea
              placeholder="Problem Description"
              size="large"
              value={problem?.description}
              rows={5}
              onChange={(e) =>
                setProblem({ ...problem, description: e?.target?.value })
              }
            ></Input.TextArea>
            {clientErrors?.description && (
              <span className="error_message">{clientErrors?.description}</span>
            )}
          </div>
          <div className={styles.input_container}>
            <Select
              size="large"
              style={{ width: "100%" }}
              placeholder={"Choose Library"}
              options={handleStepsData()}
              value={problem?.library ? problem?.library : undefined}
              onChange={(value) => {
                setProblem({ ...problem, library: value });
              }}
            ></Select>
            {clientErrors?.steps && (
              <span className="error_message">{clientErrors?.steps}</span>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        centered
        open={editProblemModal?.open}
        okButtonProps={{
          disabled: updateProblemLoading,
          loading: updateProblemLoading,
        }}
        okText="Update"
        onCancel={() =>
          setEditProblemModal({
            open: false,
            id: "",
            title: "",
            description: "",
            library: "",
            language: "",
          })
        }
        onOk={handleUpdateProblem}
        footer={[
          <Row key="footer" justify="space-between" align="middle">
            <Col>
              <Input
                placeholder="Language"
                size="small"
                value={editProblemModal?.language}
                onChange={(e) =>
                  setEditProblemModal({
                    ...editProblemModal,
                    language: e?.target?.value,
                  })
                }
              />
            </Col>
            <Col>
              <Button
                onClick={() =>
                  setEditProblemModal({
                    open: false,
                    id: "",
                    title: "",
                    description: "",
                    library: "",
                    language: "",
                  })
                }
              >
                Cancel
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                onClick={handleUpdateProblem}
                disabled={updateProblemLoading}
              >
                {updateProblemLoading ? "Updating..." : "Update"}
              </Button>
            </Col>
          </Row>,
        ]}
      >
        <div className={styles.add_problem_container}>
          <Typography.Title level={3}>Edit Problem</Typography.Title>
          <div className={styles.input_container}>
            <Input
              placeholder="Problem Title"
              size="large"
              value={editProblemModal?.title}
              onChange={(e) =>
                setEditProblemModal({
                  ...editProblemModal,
                  title: e?.target?.value,
                })
              }
            />
            {clientErrors?.title && (
              <span className="error_message">{clientErrors?.title}</span>
            )}
          </div>

          <div className={styles.input_container}>
            <Input.TextArea
              placeholder="Problem Description"
              size="large"
              rows={5}
              value={editProblemModal?.description}
              onChange={(e) =>
                setEditProblemModal({
                  ...editProblemModal,
                  description: e?.target?.value,
                })
              }
            ></Input.TextArea>
            {clientErrors?.description && (
              <span className="error_message">{clientErrors?.description}</span>
            )}
          </div>
          <div className={styles.input_container}>
            <Select
              size="large"
              style={{ width: "100%" }}
              placeholder="Choose Library"
              options={handleStepsData()}
              value={
                editProblemModal?.library
                  ? editProblemModal?.library
                  : undefined
              }
              onChange={(value) =>
                setEditProblemModal({
                  ...editProblemModal,
                  library: value,
                })
              }
            ></Select>
            {clientErrors?.steps && (
              <span className="error_message">{clientErrors?.steps}</span>
            )}
          </div>
        </div>
      </Modal>
    </BasicLayout>
  );
};

export default Home;
