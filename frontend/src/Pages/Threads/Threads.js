import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BasicLayout from "../../Layout/BasicLayout";
import axios from "axios";
import validator from "validator";
import { BASE_URL } from "../../Config";
import { toastError, toastSuccess } from "../../utils/toast";
import { useDispatch, useSelector } from "react-redux";
import { addProblem } from "../../Redux/Features/addProblemSlice";
import { Button, Input, Modal, Space, Table, Tooltip, Typography } from "antd";
import styles from "./Threads.module.scss";
import { getAllProblems } from "../../Redux/Features/getAllProblemsSlice";
import { formatDateToStandard } from "../../utils/helper";
import { updateProblem } from "../../Redux/Features/updateProblemSlice";
import { getAllThreads } from "../../Redux/Features/getAllThreadsSlice";
import { DownOutlined } from "@ant-design/icons";
import { Badge, Dropdown } from "antd";

const Threads = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: getAllThreadsData, isLoading: getAllThreadsLoading } =
    useSelector((state) => state?.getAllThreads);

  const { data: getAllProblemsData, isLoading: getAllProblemsLoading } =
    useSelector((state) => state?.getAllProblems);

  const [threadsData, setThreadsData] = useState([]);
  const [problemsData, setProblemsData] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState([]);

  useEffect(() => {
    dispatch(getAllThreads());
    dispatch(getAllProblems());
  }, []);

  useEffect(() => {
    if (getAllThreadsData?.length > 0) {
      const modifiedThreadsData = getAllThreadsData?.map((thread) => {
        const filteredProblem = getAllProblemsData?.find(
          (problem) => problem?._id?.toString() == thread?.problem?.toString()
        );
        const response = thread?.response?.map((res, i) => {
          const key = Object?.keys(res)?.find((key) => key != "stepId");
          return {
            key: i,
            name: key,
            title: res[key]?.title,
            content: res[key]?.content,
          };
        });
        return {
          ...thread,
          response: response,
          problem: filteredProblem,
        };
      });
      setProblemsData(modifiedThreadsData);
    }
  }, [getAllThreadsData, getAllProblemsData]);

  const dataSource = problemsData?.map((item, i) => {
    return {
      key: i,
      date: (
        <p className={styles.paragraph1}>
          {formatDateToStandard(item?.created_at)}
        </p>
      ),
      title: <p className={styles.paragraph2}>{item?.problem?.title}</p>,
      description: (
        <p className={styles.paragraph3}>
          <Tooltip
            title={item?.problem?.description}
          >{`${item?.problem?.description?.slice(0, 50)}${
            item?.problem?.description?.length > 78 ? "..." : ""
          }`}</Tooltip>
        </p>
      ),
    };
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "1",
      // width: "80px",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "2",
      // width: "80px",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "3",
      // width: "200px",
    },
  ];
  const expandedRowRender = (selectedRows) => {
    const columns = [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
      },
      {
        title: "Content",
        dataIndex: "content",
        key: "content",
      },
    ];

    const responses = problemsData?.map((item) => {
      return item?.response;
    });

    for (let key in responses) {
      const item = responses[key];
      if (key?.toString() == selectedRows?.key?.toString()) {
        return <Table columns={columns} dataSource={item} pagination={false} />;
      }
    }
  };

  return (
    <BasicLayout>
      <div className={styles.problems_container}>
        <div className={styles.table_container}>
          <Table
            loading={getAllThreadsLoading}
            dataSource={dataSource}
            columns={columns}
            expandable={{
              expandedRowRender,
              onExpand: (expand, data) => {
                setSelectedProblem((prev) => {
                  return [...prev, data?.key?.toString()];
                });
              },
              defaultExpandedRowKeys: ["0"],
            }}
          />
        </div>
      </div>
    </BasicLayout>
  );
};

export default Threads;
