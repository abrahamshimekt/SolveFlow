import { Modal, Input, Button } from "antd";
import ReactMarkdown from "react-markdown";
const EditorModal = (props) => {
  const {
    isEditorModalVisible,
    handleUpdateResponse,
    handleCancelEditorModal,
    editedResponse,
    compiledContent,
    setEditedResponse,
    isCompiling,
    handleDownload,
    setCompiledContent,
  } = props;
  let content = isCompiling ? compiledContent : editedResponse;
  const codeRegex = /```([\s\S]*?)```/g;
  let match;
  let lastIndex = 0;
  let processedMarkdown = "";

  while ((match = codeRegex.exec(content)) !== null) {
    const codeBlock = match[0];

    processedMarkdown += content
      .slice(lastIndex, match.index)
      .replace(/\n/g, "\n&nbsp;");
    processedMarkdown += codeBlock;
    lastIndex = match.index + codeBlock.length;
  }

  processedMarkdown += content.slice(lastIndex).replace(/\n/g, "\n&nbsp;");

  return (
    <Modal
      title={isCompiling ? "Compile All Chats" : "Edit Response"}
      open={isEditorModalVisible}
      onOk={handleUpdateResponse}
      onCancel={handleCancelEditorModal}
      okText="Save"
      cancelText="Cancel"
      width={1200}
      footer={[
        isCompiling && (
          <Button
            key="download"
            type="primary"
            onClick={handleDownload}
            value="download"
          >
            Download
          </Button>
        ),
        <Button key="cancel" onClick={handleCancelEditorModal}>
          Cancel
        </Button>,
        !isCompiling && (
          <Button key="save" type="primary" onClick={handleUpdateResponse}>
            Save
          </Button>
        ),
      ]}
    >
      <div className="boxes-container">
        <Input.TextArea
          rows={4}
          value={content}
          id="editor"
          onChange={
            isCompiling
              ? (event) => setCompiledContent(event.target.value)
              : (event) => setEditedResponse(event.target.value)
          }
          style={{ height: "80vh" }}
        />
        <div id="preview">
          <ReactMarkdown className="line-break">
            {processedMarkdown}
          </ReactMarkdown>
        </div>
      </div>
    </Modal>
  );
};

export default EditorModal;
