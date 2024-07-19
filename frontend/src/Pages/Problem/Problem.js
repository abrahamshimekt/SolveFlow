import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import validator from "validator";
import { BASE_URL } from "../../Config";
import { toastError, toastSuccess } from "../../utils/toast";
import BasicLayout from "../../Layout/BasicLayout";
import { useDispatch, useSelector } from "react-redux";
import { updateProblem } from "../../Redux/Features/updateProblemSlice";
import { getProblem } from "../../Redux/Features/getProblemSlice";

const Problem = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { data } = useSelector((state) => state?.getProblem);
  const { isLoading: updateProblemLoading } = useSelector(
    (state) => state?.updateProblem
  );
  const [problem, setProblem] = useState({ title: "", description: "" });
  const [isOnEditMode, setIsOnEditMode] = useState(false);
  let [clientErrors, setClientErrors] = useState({});

  useEffect(() => {
    dispatch(getProblem({ id }));
  }, []);

  useEffect(() => {
    setProblem({ title: data?.title, description: data?.description });
  }, [data]);

  const handleUpdateProblem = async () => {
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

    if (isErr) {
      isErr = false;
      setClientErrors(errors);
    } else {
      isErr = false;
      setClientErrors({});
      dispatch(
        updateProblem({
          data: problem,
          id,
          onSuccess: () => dispatch(getProblem({ id })),
        })
      );
    }
  };

  return (
    <BasicLayout>
      <div id="outputScreen" className="screen">
        {isOnEditMode ? (
          <Fragment>
            <h2>Update Your Problem</h2>
            <input
              type="text"
              id="problemTitle"
              placeholder="Problem Title"
              value={problem?.title}
              onChange={(e) =>
                setProblem({ ...problem, title: e?.target?.value })
              }
            />
            {clientErrors?.title && (
              <span className="error_message">{clientErrors?.title}</span>
            )}
            <textarea
              id="problemDescription"
              placeholder="Problem Description"
              value={problem?.description}
              onChange={(e) =>
                setProblem({ ...problem, description: e?.target?.value })
              }
            ></textarea>
            {clientErrors?.description && (
              <span className="error_message">{clientErrors?.description}</span>
            )}
            <button
              onClick={handleUpdateProblem}
              disabled={updateProblemLoading}
            >
              Update Problem
            </button>
          </Fragment>
        ) : (
          <Fragment>
            <h2 id="outputTitle">{problem?.title}</h2>
            <p id="outputDescription">{problem?.description}</p>
            <button onClick={() => setIsOnEditMode(true)}>Edit</button>
          </Fragment>
        )}
      </div>
    </BasicLayout>
  );
};

export default Problem;
