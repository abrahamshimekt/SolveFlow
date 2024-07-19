import axios from "axios";
const { BASE_URL } = require("../Config");

const generateMergedDocument = async (formData) => {
  let filename = "";

  try {
    // Step 1: Merge document
    const mergeDocumentResponse = await axios.post(
      `${BASE_URL}/api/user/document/merge`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    filename = mergeDocumentResponse?.data?.data;

    // Step 2: Fetch the merged document
    const getMergedDocumentResponse = await axios.get(
      `${BASE_URL}/api/user/document/${filename || "default.docx"}`,
      {
        responseType: "blob",
      }
    );

    return getMergedDocumentResponse.data; // Return the fetched document data
  } catch (error) {
    console.log("There was an error merging or fetching the document!", error);
    return null; // Return null or handle the error as needed
  }
};

export default generateMergedDocument;
