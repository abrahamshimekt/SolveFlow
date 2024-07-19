import React, { useEffect, useState } from "react";
import { getPastProblems } from "../../utils/helper";
import { useNavigate } from "react-router-dom";
import BasicLayout from "../../Layout/BasicLayout";
import { useDispatch, useSelector } from "react-redux";
import { getAllProblems } from "../../Redux/Features/getAllProblemsSlice";

const PastProblems = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data } = useSelector((state) => state?.getAllProblems);

  useEffect(() => {
    dispatch(getAllProblems());
  }, []);

  const handleProblem = (id) => {
    navigate(`/problem/${id}`);
  };
  return (
    <BasicLayout>
      <div id="pastProblemsScreen" className="screen">
        <h2>Past Problems</h2>
        <ul id="pastProblemsList">
          {data?.map((problem, index) => (
            <li key={index} onClick={() => handleProblem(problem?._id)}>
              {problem?.title}
            </li>
          ))}
        </ul>
      </div>
    </BasicLayout>
  );
};

export default PastProblems;
