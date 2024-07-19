import React, { Fragment, useEffect } from "react";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  useNavigate,
  Routes,
  useLocation,
} from "react-router-dom";
import Home from "../Pages/Home/Home";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PastProblems from "../Pages/PastProblems/PastProblems";
import Problem from "../Pages/Problem/Problem";
import { useDispatch } from "react-redux";
import { getUser } from "../Redux/Features/getUserSlice";
import { getCookie, getQueryParameters, setCookie } from "../utils/helper";
import setAuthToken from "../utils/setAuthToken";
import ProblemConversation from "../Pages/ProblemConversation/ProblemConversation";
import Register from "../Pages/Register/Register";
import Threads from "../Pages/Threads/Threads";
import About from "../Pages/About/About";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";

function useQuery(key) {
  const { search } = useLocation();
  return new URLSearchParams(search).get(key);
}
const AppRoutes = () => {
  const navigate = useNavigate(); // Access navigate function from useNavigate
  const dispatch = useDispatch();

  const queryToken = useQuery("token");

  useEffect(() => {
    const initializeApp = async () => {
      const token = getCookie("token");
      if (token) {
        setAuthToken(token);
        dispatch(getUser(token));
      }

      if (queryToken) {
        setCookie("token", queryToken);
        setAuthToken(queryToken);
        dispatch(getUser(queryToken));

        const authType = sessionStorage?.getItem("authType");
        if (authType?.toUpperCase() === "SIGN_IN") {
          navigate("/home");
        } else if (authType?.toUpperCase() === "SIGN_UP") {
          navigate("/about");
        } else {
          navigate("/home");
        }
        sessionStorage?.removeItem("authType");
      }
    };

    initializeApp();
  }, [queryToken]);

  return (
    <Fragment>
      <ToastContainer />
      <Routes>
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />
        <Route
          path="/threads"
          element={<PrivateRoute element={<Threads />} />}
        />
        <Route path="/about" element={<PrivateRoute element={<About />} />} />
        <Route
          path="/chat/:id"
          element={<PrivateRoute element={<ProblemConversation />} />}
        />
        <Route path="/" element={<PublicRoute element={<Register />} />} />
      </Routes>
    </Fragment>
  );
};

export default AppRoutes;
