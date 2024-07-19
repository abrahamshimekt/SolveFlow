import React, { useState } from "react";
import { Modal, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const MergeDocumentModal = (props) => {
  const {
    isMergeDocumentModalVisible,
    handleMergeDocument,
    handleCancelMergeDocument,
    setDocumentFile,
    documentFile,
  } = props;

  const [fileList, setFileList] = useState(documentFile);

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
    setDocumentFile(fileList[0]?.originFileObj || null);
  };

  const beforeUpload = (file) => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("File must be smaller than 5MB!");
    }
    return isLt5M;
  };

  return (
    <Modal
      title="Merge Document"
      open={isMergeDocumentModalVisible}
      onOk={handleMergeDocument}
      onCancel={handleCancelMergeDocument}
      okText="Save"
      cancelText="Cancel"
      footer={[
        <Button
          key="merge"
          type="primary"
          onClick={handleMergeDocument}
          value="download"
        >
          Merge Document
        </Button>,
        <Button key="cancel" onClick={handleCancelMergeDocument}>
          Cancel
        </Button>,
      ]}
      style={{height: "80vh" }} // Adjust the height as needed
      styles={{ maxHeight: "calc(80vh - 108px)", overflowY: "auto" }} // Adjust body height and add scroll
    >
      <Upload
        name="file"
        listType="text"
        fileList={fileList}
        onChange={handleUploadChange}
        beforeUpload={beforeUpload}
      >
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>
    </Modal>
  );
};

export default MergeDocumentModal;
