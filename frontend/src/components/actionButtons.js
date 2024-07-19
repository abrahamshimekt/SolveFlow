import React from "react";
import { Col, Row, Button } from "antd";

const ActionButtons = ({
  isMoreButtons,
  i,
  item,
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
}) => {
  return (
    <Row justify="space-between" align="middle" gutter={[8, 8]}>
      {!resume.hasOwnProperty(item.data.step?.key) && isMoreButtons[i] && (
        <>
          <Col>
            <Button
              type="dashed"
              onClick={() =>
                handleAcceptResponse(i, {
                  ...item?.data,
                })
              }
              disabled={acceptResponseLoading}
              loading={acceptResponseLoading}
            >
              Accept
            </Button>
          </Col>
          <Col>
            <Button
              type="dashed"
              disabled={humanCheckerLoop?.[item?.data?.step?.key] ?? true}
              onClick={() => handleRejectResponse(i)}
            >
              Reject
            </Button>
          </Col>
          {!responseReject[item?.data?.step?.key] && (
            <Col>
              <Button type="dashed" onClick={() => handleRequeryResponse()}>
                Requery
              </Button>
            </Col>
          )}
          <Col>
            <Button
              type="dashed"
              onClick={() => handleEditResponse({ ...item?.data })}
            >
              Edit
            </Button>
          </Col>
        </>
      )}

      <Col>
        <Button
          type="dashed"
          className="debug-hidden"
          style={{
            color: "red",
            marginLeft: "auto",
            display: isMdOrAbove ? "none" : "block",
            fontSize: "14px",
          }}
          onClick={() => handleDebug(item?.data?.library?.stepId)}
        >
          Debug
        </Button>
      </Col>
    </Row>
  );
};

export default ActionButtons;
