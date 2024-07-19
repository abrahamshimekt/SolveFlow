import moment from "moment";
import { toastError } from "./toast";
export const formatDate = (date, format) => {
  return moment(date).format(format);
};

export const formatDateToStandard = (date) => {
  const momentInstance = moment(date, false);
  return momentInstance.isValid() ? momentInstance.format("DD-MM-YYYY") : "N/A";
};

export const formatTimestamp = (date) => {
  const newDate = moment.unix(date / 1000);
  return newDate.format("DD-MM-YYYY");
};

export const setCookie = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getCookie = (key) => {
  const storedData = localStorage.getItem(key);
  if (!storedData) {
    return "";
  }
  try {
    return JSON.parse(storedData);
  } catch (error) {
    console.error("Error parsing JSON from cookie:", storedData);
    return null;
  }
};

export const removeCookie = (key) => {
  return localStorage.removeItem(key);
};

export const getQueryParameters = (url) => {
  const queryParams = {};

  const queryString = url.split("?")[1];

  if (queryString) {
    const paramPairs = queryString.split("&");

    paramPairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      queryParams[key] = decodeURIComponent(value);
    });
  }

  return queryParams;
};

export const axiosErrorHandler = (error) => {
  if (error?.response?.status === 500) {
    toastError(error?.response?.data);
  }
  if (error?.response?.status === 401) {
    removeCookie("token");
    sessionStorage?.removeItem("authType");
    window.location.pathname = "/";
  }
  if (error?.response?.status === 400) {
    for (let errorData of error?.response?.data?.errors) {
      toastError(errorData?.message);
    }
  }
};
