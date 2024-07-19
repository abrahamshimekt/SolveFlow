import React from "react";
import { Modal, Button, Spin } from "antd";
import { JsonViewer } from "@textea/json-viewer";

const DebugViewerModal = ({ logs, open, onCancel, loading }) => {
  return (
    <Modal
      title="Debug"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
      ]}
      width={800}
    >
      <div className="boxes-container">
        {loading ? (
          <Spin tip="Loading...">
            <div style={{ height: "400px" }} />{" "}
          </Spin>
        ) : (
          <JsonViewer
            value={logs}
            theme="monokai"
            collapsed={false}
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard={true}
            style={{ whiteSpace: "pre-wrap" }}
          />
        )}
      </div>
    </Modal>
  );
};

export default DebugViewerModal;
