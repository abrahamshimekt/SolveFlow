import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCookie } from "../utils/helper";
import { useSelector } from "react-redux";

const PublicRoute = ({ children, element }) => {
  const { isSuccess, isError } = useSelector((state) => state?.getUser);
  let [isToken, setIsToken] = useState(getCookie("token"));
  let [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let data = getCookie("token");
    setIsLoading(false);
    setIsToken(data);
  }, []);

  if (!isSuccess || !isToken) return children || element;
  if (!isLoading) return <Navigate to={"/home"} />;
};

export default PublicRoute;
