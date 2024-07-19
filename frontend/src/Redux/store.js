import { configureStore } from "@reduxjs/toolkit";
import getUserSlice from "./Features/getUserSlice";
import addProblemSlice from "./Features/addProblemSlice";
import getAllProblemsSlice from "./Features/getAllProblemsSlice";
import updateProblemSlice from "./Features/updateProblemSlice";
import getProblemSlice from "./Features/getProblemSlice";
import addChatSlice from "./Features/addChatSlice";
import acceptResponseSlice from "./Features/acceptResponseSlice";
import userLogoutSlice from "./Features/userLogoutSlice";
import getAllThreadsSlice from "./Features/getAllThreadsSlice";
import restartProblemSlice from "./Features/restartProblemSlice";
import getLibrarySlice from "./Features/getLibrarySlice";
import deleteProblemSlice from "./Features/deleteProblemSlice";
export const store = configureStore({
  reducer: {
    getUser: getUserSlice,
    addProblem: addProblemSlice,
    getAllProblems: getAllProblemsSlice,
    updateProblem: updateProblemSlice,
    getProblem: getProblemSlice,
    addChat: addChatSlice,
    acceptResponse: acceptResponseSlice,
    userLogout: userLogoutSlice,
    getAllThreads: getAllThreadsSlice,
    restartProblem: restartProblemSlice,
    getLibrary: getLibrarySlice,
    deleteProblem:deleteProblemSlice
  },
});
