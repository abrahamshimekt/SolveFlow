import React, { useEffect, useRef, useState } from "react";
import { Input } from "antd";
import styles from "./ProblemConversation.module.scss";
import BasicLayout from "../../Layout/BasicLayout";
import { useDispatch, useSelector } from "react-redux";
import { addChat, resetChatData } from "../../Redux/Features/addChatSlice";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProblem,
  resetProblemData,
} from "../../Redux/Features/getProblemSlice";
import { acceptResponse } from "../../Redux/Features/acceptResponseSlice";
import { toastError, toastWarning } from "../../utils/toast";
import handleDownload from "../../utils/wordDocumentUtils";
import axios from "axios";
import { getCookie } from "../../utils/helper";
import setAuthToken from "../../utils/setAuthToken";
import { v4 as uuidv4 } from "uuid";
import { BASE_URL } from "../../Config";
import EditorModal from "../../components/editorModal";
import MergeDocumentModal from "../../components/mergeDocumentModal";
import plantUMLImageGenerator from "../../utils/plantUMLCodeToImageGenerator";
import generateMergedDocument from "../../utils/generateMergedDocument";
import ChatList from "../../components/chatList";

const ProblemConversation = () => {
  const { id: problemId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    data: problemData,
    isSuccess: problemDataSuccess,
    isLoading: problemDataLoading,
  } = useSelector((state) => state?.getProblem);
  const { isLoading: acceptResponseLoading } = useSelector(
    (state) => state?.acceptResponse
  );
  const {
    data: addChatData,
    isLoading: addChatLoading,
    isSuccess: addChatSuccess,
    status: addChatStatus,
    errrors: initialErrors,
  } = useSelector((state) => state?.addChat);
  const [isResume, setIsResume] = useState(false);
  const [isChatCompleted, setIsChatCompleted] = useState(false);
  const [isWritting, setIsWritting] = useState(true);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [resume, setResume] = useState({});
  const [chats, setChats] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isChat, setIsChat] = useState(false);
  const [message, setMessage] = useState("");
  const [editedResponse, setEditedResponse] = useState("");
  const [isEditorModalVisible, setIsEditorModalVisible] = useState(false);
  const [isMergeDocumentModalVisible, setIsMergeDocumentModalVisible] =
    useState(false);

  const [isCompiling, setIsCompiling] = useState(false);
  const [humanCheckerLoop, setHumanCheckerLoop] = useState({});
  const [aiChecking, setAIChecking] = useState({});
  const [stepLogs, setStepLogs] = useState("");
  const [openDebugModal, setOpenDebugModal] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [userId, setUserId] = useState("");
  const [compiledContent, setCompiledContent] = useState("");
  const [jsonViewLoading, setJsonViewLoading] = useState(true);
  const containerRef = useRef(null);
  const [isMoreButtons, setIsMoreButtons] = useState([]);
  const [isMdOrAbove, setIsMdOrAbove] = useState(window.innerWidth >= 768);
  const [isSMOrBellow, setIsSMOrBellow] = useState(window.innerWidth < 768);
  const [documentFile, setDocumentFile] = useState(null);
  const [responseReject, setResponseReject] = useState({});
  useEffect(() => {
    const handleResize = () => {
      setIsMdOrAbove(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsSMOrBellow(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const resetState = () => {
      setChats([]);
      setHumanCheckerLoop({});
      setResponseReject({});
      setIsMoreButtons([]);
      setIsTyping(false);
      setIsChatCompleted(false);
      setConversationId("");
      setIsWritting(true);
      setIsChat(false);
      setIsResume(false);
      setResume({});
      setAIChecking({});
      setMessage("");
      dispatch(resetProblemData());
      dispatch(resetChatData());
    };
    resetState();
    return resetState;
  }, []);

  useEffect(() => {
    const token = getCookie("token");
    setAuthToken(token);
    const userId = getCookie("userId");
    setUserId(userId);
    const newUUID = uuidv4();
    if (problemId && newUUID) {
      dispatch(
        getProblem({
          id: problemId,
          conversationId: newUUID,
          onSuccess: (data, conversationId) => {
            if (data?.stepCount > 0 && data?.stepCount <= data?.maxCount) {
              setIsResume(true);
              const storedConversationId =
                localStorage.getItem("conversationId");
              setConversationId(storedConversationId);
              if (data?.stepCount === data?.maxCount) {
                setIsChatCompleted(true);
              }
            } else {
              localStorage.setItem("conversationId", newUUID);
              setConversationId(newUUID);
            }
            autoActivateProblem(data, conversationId);
          },
        })
      );
    }
  }, [problemId]);

  useEffect(() => {
    const token = getCookie("token");
    setAuthToken(token);
    const getThread = async () => {
      if (isResume) {
        try {
          const response = await axios.get(
            `${BASE_URL}/api/user/threads/${problemId}`
          );
          const thread = response.data;

          if (thread?.data?.[0]?.response) {
            const newChats = thread.data[0].response.map((responseStep) => {
              return {
                data: responseStep,
              };
            });

            newChats.forEach((chat) => {
              setIsMoreButtons((prev) => [...prev, true]);
              const stepKey = chat?.data?.step?.key;
              if (stepKey) {
                setResume((prevResume) => {
                  // Create a copy of prevResume to safely mutate it
                  const updatedResume = { ...prevResume };
                  updatedResume[stepKey] = true;
                  return updatedResume;
                });
              }
            });

            setChats((prevChats) => [...prevChats, ...newChats]);
          } else {
            console.log("No response data found in thread");
          }
        } catch (error) {
          console.log("Error:", error);
        } finally {
          setIsLoadingChats(false);
        }
      }
    };

    getThread();
  }, [isResume]);

  useEffect(() => {
    const addConversation = async () => {
      if (conversationId && userId) {
        try {
          await axios.post(`${BASE_URL}/api/user/conversations/`, {
            conversationId,
            problemId,
            userId,
          });
        } catch (error) {
          console.log("error:", error);
        }
      }
    };
    if (!isResume) {
      addConversation();
    }
  }, [conversationId]);

  const scrollToBottom = () => {
    if (containerRef?.current) {
      containerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
      containerRef?.current?.scrollTo(0, 1e10);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  useEffect(() => {
    if (!isResume && addChatData && Object?.keys(addChatData)?.length > 0) {
      setChats((prev) => {
        return [...prev, { role: "assistant", data: addChatData }];
      });
    }

    setIsMoreButtons((prev) => [...prev, true]);
  }, [addChatData]);
  useEffect(() => {
    const aiCheckerAndHumanChecker = async () => {
      const lastChat = chats[chats.length - 1]?.data;
      if (!lastChat || isResume) return;

      const currentStep = lastChat.step;
      if (!currentStep) return;

      const {
        task,
        input,
        format,
        aiChecker,
        aiCheckerInstructions,
        aiCheckerThreshold = 10,
        humanCheckerStyle = "never",
        humanCheckerThreshold = 8,
      } = currentStep;
      const language = lastChat.language;
      const currentResponse = lastChat[currentStep.key]?.content || "";
      const { _id, stepId } = lastChat.library;
      let previousUserMessage = `${task}\n---\n${input}`;

      if (format) {
        previousUserMessage += `\n---\nFormat using ${format}`;
      }

      let aiChecked = false;
      let aiCheckedValue = 8;

      if (aiChecker) {
        try {
          const aiEvalResponse = await axios.post(
            `${BASE_URL}/api/user/chats/aiEval`,
            {
              previousUserMessage,
              aiInstruction: aiCheckerInstructions || "",
              aichecker: aiChecker,
              currentResponse,
              language,
              conversationId,
              stepId,
              libraryId: _id,
              debugLevel: 0,
              action: "AI Eval",
            }
          );

          aiCheckedValue = aiEvalResponse.data?.data[0];
          aiChecked = true;

          if (aiCheckedValue < aiCheckerThreshold) {
            try {
              const aiRequeryResponse = await axios.post(
                `${BASE_URL}/api/user/chats/aiRequery`,
                {
                  aichecker: aiChecker,
                  previousUserMessage,
                  currentResponse,
                  currentStepKey: currentStep.key,
                  recommendations: aiEvalResponse.data?.data[1],
                  language,
                  conversationId,
                  stepId,
                  libraryId: _id,
                  debugLevel: 0,
                  action: "AI Requery",
                }
              );

              updateChatHelper(aiRequeryResponse.data);
            } catch (error) {
              toastError("AI Requery failed");
              updateChatHelper(currentResponse);
              console.error("AI Requery Error:", error);
            }
          }
        } catch (error) {
          toastError("AI Evaluation failed");
          updateChatHelper(currentResponse);
          console.error("AI Evaluation Error:", error);
        }
      }

      if (
        humanCheckerStyle === "always" ||
        (humanCheckerStyle === "threshold" &&
          aiChecked &&
          aiCheckedValue < humanCheckerThreshold)
      ) {
        setHumanCheckerLoop((prevHumanCheckerLoop) => ({
          ...prevHumanCheckerLoop,
          [currentStep.key]: false,
        }));
      }

      setAIChecking((prevAIChecking) => ({
        ...prevAIChecking,
        [currentStep.key]: false,
      }));
    };

    aiCheckerAndHumanChecker();
  }, [chats.length]);

  const autoActivateProblem = (data, conversationId, HCAnswer = "") => {
    handleMessage(data, conversationId, HCAnswer);
  };

  const handleMessage = async (
    data,
    conversationId,
    humanCheckerAnswer = ""
  ) => {
    setIsChat(false);
    setIsTyping(true);
    const newData = {};
    if (chats?.length === 0) {
      newData.role = "user";
      newData.content = problemData?.description || data?.description;
      newData.additionalInformation = message;
      const newChats = [...chats, { ...newData }];
      setChats(newChats);
    }
    if (message) {
      newData.role = "user";
      newData.content = message;
      newData.additionalInformation = message;
      const newChats = [...chats, { ...newData }];
      setChats(newChats);
    }

    dispatch(
      addChat({
        id: problemId,
        role: "user",
        content: problemData?.description || data?.description,
        humanCheckerAnswer,
        additionalInformation: message,
        conversationId,
        debugLevel: 0,
        action: message ? "reject" : "Initial Query",

        onSuccess: (data) => {
          setIsTyping(false);
          if (data?.status === "STEPS_COMPLETED") {
            navigate("/");
          }
        },
        onError: () => {
          setIsTyping(false);
        },
      })
    );

    setMessage("");
  };

  const handleAcceptResponse = async (index, data) => {
    const { _id, stepId } = chats[chats.length - 1]?.data?.library;
    const currentStep = chats[chats.length - 1]?.data?.step;
    const input = data;
    const startTime = Date.now();
    dispatch(
      acceptResponse({
        id: problemId,
        data: { response: data },
        onSuccess: () => {
          autoActivateProblem(
            chats[chats?.length - 2]?.content,
            conversationId
          );
          setIsMoreButtons((prev) => {
            const newButtons = [...prev];
            newButtons[index] = false;
            return newButtons;
          });
        },
      })
    );

    const endTime = Date.now();
    const duration = endTime - startTime;
    const action = "accept";
    const output = chats[chats.length - 1]?.data;
    const error = "";
    const debugLevel = 0;

    const log = {
      conversationId,
      stepId,
      libraryId: _id,
      debugLevel,
      action,
      duration,
      input,
      output,
      error,
    };

    await axios
      .post(`${BASE_URL}/api/user/logs/`, log)

      .catch((error) => {
        console.log("log add error:", error);
      })
      .finally(() => {
        setHumanCheckerLoop((prevHumanCheckerLoop) => ({
          ...prevHumanCheckerLoop,
          [currentStep.key]: true,
        }));
        setResponseReject((prevRejectResponse) => ({
          ...prevRejectResponse,
          [currentStep.key]: false,
        }));
      });
  };

  const handleRejectResponse = (index) => {
    toastWarning("Please provide additional input for future guidance");
    setIsChat(true);

    setIsMoreButtons((prev) => {
      const newButtons = [...prev];
      newButtons[index] = false;
      return newButtons;
    });

    const currentStep = chats[chats.length - 1]?.data?.step;
    setResponseReject((prevRejectResponse) => ({
      ...prevRejectResponse,
      [currentStep.key]: true,
    }));
  };

  // Function to handle opening the modal for editing the response
  const handleEditResponse = async (chatItem) => {
    const lastChatIndex = chats.length - 1;
    const currentStep = chats[lastChatIndex]?.data?.step;
    const startTime = Date.now();
    if (currentStep && chats[lastChatIndex]?.data[currentStep.key]) {
      setEditedResponse(
        chats[lastChatIndex]?.data[currentStep.key]?.content || ""
      );
      setIsEditorModalVisible(true);
    } else {
      console.error(
        "Error: Unable to find the current step or the last chat data."
      );
    }
    const endTime = Date.now();

    const { _id, stepId } = chats[chats.length - 1]?.data?.library;
    const input = chatItem;
    const duration = endTime - startTime;
    const action = "Edit";
    const output = editedResponse;
    const error = "";
    const debugLevel = 1;

    const log = {
      conversationId,
      stepId,
      libraryId: _id,
      debugLevel,
      action,
      duration,
      input,
      output,
      error,
    };
    await axios.post(`${BASE_URL}/api/user/logs/`, log).catch((error) => {
      console.log("log add error:", error);
    });
  };
  const updateChatHelper = (newContent) => {
    setChats((prevChats) => {
      const lastChatIndex = prevChats.length - 1;
      const currentStep = prevChats[lastChatIndex]?.data?.step;

      if (currentStep && prevChats[lastChatIndex]?.data[currentStep.key]) {
        if (newContent) {
          return prevChats.map((chat, index) => {
            if (index === lastChatIndex) {
              const updatedChat = {
                ...chat,
                data: {
                  ...chat.data,
                  [currentStep.key]: {
                    ...chat.data[currentStep.key],
                    content: newContent,
                  },
                },
              };
              return updatedChat;
            }
            return chat;
          });
        }
      }

      return prevChats;
    });
  };
  const handleUpdateResponse = () => {
    updateChatHelper(editedResponse);
    setIsEditorModalVisible(false);
  };

  const handleRequeryResponse = async () => {
    // Remove the last response from the chats
    const newChats = chats.slice(0, -1);

    // Set the updated chats state
    setChats(newChats);
    setIsTyping(true);
    // Dispatch the new query
    dispatch(
      addChat({
        id: problemId,
        role: "user",
        content: problemData?.description,
        additionalInformation:
          "The previous response wasn't good please generate better response",
        conversationId,
        debugLevel: 0,
        action: "requiry",
        onSuccess: (data) => {
          setIsTyping(false);
          if (data?.status === "STEPS_COMPLETED") {
            navigate("/");
          }
        },
        onError: () => {
          setIsTyping(false);
        },
      })
    );
  };

  const handleResume = () => {
    setIsResume(false);
  };
  const handleCompileToDoc = async () => {
    let compiledContent = "";
    for (let chat of chats) {
      const dataKeys = Object.keys(chat.data || {});

      // Loop through each key in chat data
      for (let key of dataKeys) {
        if (chat.data[key]?.content) {
          compiledContent += handleContent(chat.data[key].content) + "\n";
        }
      }
    }

    // Set the compiled content to the edited response
    setCompiledContent(compiledContent.trim());
    setIsCompiling(true);
    setIsEditorModalVisible(true);
  };

  const handleContent = (content) => {
    // Handle code blocks
    const codeRegex = /```(\w*)\n([\s\S]*?)\n```/g;
    content = content.replace(codeRegex, (match, language, code) => {
      return `\`\`\`${language}\n${code}\n\`\`\``;
    });

    // Handle images
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    content = content.replace(imageRegex, (match, url) => {
      return "[Image]";
    });

    return content;
  };

  const handleCancelEditorModal = () => {
    setIsEditorModalVisible(false);
    setEditedResponse("");
    setIsCompiling(false);
  };
  const handleCancelMergeDocument = () => {
    setDocumentFile(null);
    setIsMergeDocumentModalVisible(false);
  };
  const handleDebug = async (stepId) => {
    setOpenDebugModal(true);

    await axios
      .get(
        `${BASE_URL}/api/user/logs/currentlogs?stepId=${stepId}&&conversationId=${conversationId}`
      )
      .then((response) => {
        setStepLogs(response.data);
      })
      .catch((error) => {
        console.log("Error:", error);
      })
      .finally(() => {
        setJsonViewLoading(false);
      });
  };

  const cancelDebugModal = async () => {
    setOpenDebugModal(false);
  };

  const handleEnterPress = (e) => {
    const stepKey = chats[chats.length - 1]?.data?.step?.key || "";
    if (e.key === "Enter") {
      let HCAnswer = "";
      if (stepKey) {
        HCAnswer = chats[chats.length - 1]?.data[stepKey]?.content;
      }
      handleMessage(message, conversationId, HCAnswer);
      setMessage("");
    }
  };
  const handleMergeDocument = async () => {
    if (documentFile) {
      const data = chats[chats.length - 1]?.data?.data || {};
      const formData = new FormData();
      const steps = Object.keys(data);

      for (const step of steps) {
        const stepContent = data[step]?.content || "";
        let match;
        const codeRegex = /```plantuml\s*@startuml([\s\S]*?)@enduml\s*```/g;

        while ((match = codeRegex.exec(stepContent)) !== null) {
          let codeContent = match[0];
          const imageData = await plantUMLImageGenerator(codeContent, userId);
          if (imageData) {
            formData.append(`${step}`.toUpperCase(), imageData);
          }
        }

        formData.append(`step_${step}`.toUpperCase(), stepContent);
      }

      formData.append("doc", documentFile);

      const documentData = await generateMergedDocument(formData);
      if (documentData) {
        const url = window.URL.createObjectURL(new Blob([documentData]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${Date.now()}_merged.docx`);
        document.body.appendChild(link);
        link.click();
      }
    }
  };

  return (
    <BasicLayout
      isPadding={false}
      handleCompileToDoc={handleCompileToDoc}
      setIsMergeDocumentModalVisible={setIsMergeDocumentModalVisible}
      libraryTitle={problemData?.library?.name}
    >
      <div className={styles.problem_conversation_container} ref={containerRef}>
        {isLoadingChats && isResume ? (
          <div className={styles.shimmerWrapper}>
            <div
              className={`${styles.shimmer} ${styles.shimmerLine} ${styles.short}`}
            ></div>
            <div
              className={`${styles.shimmer} ${styles.shimmerLine} ${styles.medium}`}
            ></div>
            <div
              className={`${styles.shimmer} ${styles.shimmerLine} ${styles.long}`}
            ></div>
            <div
              className={`${styles.shimmer} ${styles.shimmerLine} ${styles.short}`}
            ></div>
            <div
              className={`${styles.shimmer} ${styles.shimmerLine} ${styles.medium}`}
            ></div>
          </div>
        ) : (
          <ChatList
            chats={chats}
            conversationId={conversationId}
            handleAcceptResponse={handleAcceptResponse}
            acceptResponseLoading={acceptResponseLoading}
            handleRejectResponse={handleRejectResponse}
            handleRequeryResponse={handleRequeryResponse}
            handleEditResponse={handleEditResponse}
            humanCheckerLoop={humanCheckerLoop}
            responseReject={responseReject}
            handleDebug={handleDebug}
            isMdOrAbove={isMdOrAbove}
            isSMOrBellow={isSMOrBellow}
            isMoreButtons={isMoreButtons}
            aiChecking={aiChecking}
            userId={userId}
            stepLogs={stepLogs}
            openDebugModal={openDebugModal}
            cancelDebugModal={cancelDebugModal}
            jsonViewLoading={jsonViewLoading}
            isTyping={isTyping}
            resume={resume}
            isResume={isResume}
            isChatCompleted={isChatCompleted}
            handleResume={handleResume}
            isWritting={isWritting}
            setIsWritting={setIsWritting}
          />
        )}
        <div className={styles.input_container}>
          <Input.TextArea
            rows={3}
            size="large"
            value={message}
            placeholder="Type a message here and hit Enter..."
            onChange={(e) => setMessage(e?.target?.value)}
            onPressEnter={handleEnterPress}
            disabled={!isChat}
          />
        </div>
      </div>

      <EditorModal
        isEditorModalVisible={isEditorModalVisible}
        handleUpdateResponse={handleUpdateResponse}
        handleCancelEditorModal={handleCancelEditorModal}
        editedResponse={editedResponse}
        compiledContent={compiledContent}
        setEditedResponse={setEditedResponse}
        setCompiledContent={setCompiledContent}
        isCompiling={isCompiling}
        handleDownload={handleDownload(compiledContent)}
      />
      <MergeDocumentModal
        isMergeDocumentModalVisible={isMergeDocumentModalVisible}
        handleMergeDocument={handleMergeDocument}
        handleCancelMergeDocument={handleCancelMergeDocument}
        setDocumentFile={setDocumentFile}
        documentFile={documentFile}
      />
    </BasicLayout>
  );
};

export default ProblemConversation;
