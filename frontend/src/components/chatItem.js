import React, { Fragment } from "react";
import { Typography, Button } from "antd";
import cc from "classnames";
import PlantUMLCodeCorrector from "./plantUMLCodeCorrector";
import ActionButtons from "./actionButtons";
import styles from "../Pages/ProblemConversation/ProblemConversation.module.scss";

const ChatItem = ({
  item,
  i,
  aiChecking,
  chats,
  conversationId,
  userId,
  isMoreButtons,
  handleAcceptResponse,
  acceptResponseLoading,
  humanCheckerLoop,
  handleRejectResponse,
  responseReject,
  handleRequeryResponse,
  handleEditResponse,
  isMdOrAbove,
  handleDebug,
  resume,
  isSMOrBellow,
  isWritting,
  setIsWritting,
}) => {
  const stepKey = item?.data?.step?.key;
  const isUser = item?.role?.toUpperCase() === "USER";
  const aiChecker = item?.data?.step?.aiChecker;
  const isChecking = aiChecking?.[stepKey] ?? true;

  const renderActionButtons = () => {
    if (isWritting) return null;
    return (
      <ActionButtons
        isMoreButtons={isMoreButtons}
        i={i}
        item={item}
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
      />
    );
  };

  const renderContent = () => {
    return (
      <PlantUMLCodeCorrector
        componentKey={stepKey}
        content={item?.data[stepKey]?.content}
        title={item?.data[stepKey]?.title}
        chats={chats}
        conversationId={conversationId}
        userId={userId}
        language={item?.data?.language}
        isWritting={isWritting}
        setIsWritting={setIsWritting}
      />
    );
  };

  const renderDebugButton = () => {
    if (isWritting) return null;
    return (
      <Button
        type="dashed"
        style={{
          color: "red",
          marginLeft: "auto",
          display: isSMOrBellow ? "none" : "block",
          fontSize: "14px",
        }}
        onClick={() => handleDebug(item?.data?.library?.stepId)}
        className="debug"
      >
        Debug
      </Button>
    );
  };

  const renderContentAndActions = () => (
    <>
      {renderContent()}
      <div className={styles.button_container} key={i}>
        {renderActionButtons()}
        {renderDebugButton()}
      </div>
    </>
  );

  return (
    <div className={cc(styles.chats, isUser && styles.chats_user)} key={i}>
      {item?.content ? (
        <Typography.Paragraph
          className={cc(styles.paragraph2, isUser && styles.colorBlue)}
        >
          {isUser ? item?.content : null}
        </Typography.Paragraph>
      ) : (
        <Fragment>
          {item?.data && (
            <>
              {!resume.hasOwnProperty(stepKey) && aiChecker ? (
                isChecking ? (
                  <div className={styles.typing_container} key={stepKey}>
                    <Typography.Paragraph>AI checking...</Typography.Paragraph>
                  </div>
                ) : (
                  renderContentAndActions()
                )
              ) : (
                renderContentAndActions()
              )}
            </>
          )}
        </Fragment>
      )}
    </div>
  );
};

export default ChatItem;
