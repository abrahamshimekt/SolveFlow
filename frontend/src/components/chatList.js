import React from "react";
import { Col, Typography, Button } from "antd";
import DebugViewerModal from "./debugViewerModal";
import styles from "../Pages/ProblemConversation/ProblemConversation.module.scss";
import ChatItem from "./chatItem";

const ChatList = ({
  chats,
  conversationId,
  handleAcceptResponse,
  acceptResponseLoading,
  handleRejectResponse,
  handleRequeryResponse,
  handleEditResponse,
  humanCheckerLoop,
  responseReject,
  handleDebug,
  isMdOrAbove,
  isSMOrBellow,
  isMoreButtons,
  aiChecking,
  userId,
  stepLogs,
  openDebugModal,
  cancelDebugModal,
  jsonViewLoading,
  isTyping,
  isResume,
  resume,
  isChatCompleted,
  handleResume,
  isWritting,
  setIsWritting
}) => {
  return (
    <div className={styles.chats_container}>
      {chats?.map((item, i) => (
        <ChatItem
          key={i}
          item={item}
          i={i}
          aiChecking={aiChecking}
          chats={chats}
          conversationId={conversationId}
          userId={userId}
          isMoreButtons={isMoreButtons}
          handleAcceptResponse={handleAcceptResponse}
          acceptResponseLoading={acceptResponseLoading}
          humanCheckerLoop={humanCheckerLoop}
          handleRejectResponse={handleRejectResponse}
          responseReject={responseReject}
          handleRequeryResponse={handleRequeryResponse}
          handleEditResponse={handleEditResponse}
          isMdOrAbove={isMdOrAbove}
          handleDebug={handleDebug}
          resume={resume}
          isSMOrBellow={isSMOrBellow}
          isWritting={isWritting}
          setIsWritting={setIsWritting}
        />
      ))}

      {isResume && !isChatCompleted && (
        <Col>
          <Button type="primary" onClick={() => handleResume()}>
            Resume
          </Button>
        </Col>
      )}

      {!isResume && isTyping && (
        <div className={styles.typing_container}>
          <Typography.Paragraph>Typing...</Typography.Paragraph>
        </div>
      )}

      <DebugViewerModal
        logs={stepLogs}
        open={openDebugModal}
        onCancel={cancelDebugModal}
        loading={jsonViewLoading}
      />
    </div>
  );
};

export default ChatList;