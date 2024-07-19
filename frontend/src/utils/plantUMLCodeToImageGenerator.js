import axios from "axios";
import { BASE_URL } from "../Config";

const plantUMLImageGenerator = async (correctedCode, userId) => {
  let filename = "";

  try {
    const generateImageResponse = await axios.post(
      `${BASE_URL}/api/user/plantUML/generateImage`,
      {
        plantumlCode: correctedCode,
        userId,
      }
    );
    filename = generateImageResponse?.data?.data;

    const getImageResponse = await axios.get(
      `${BASE_URL}/api/user/plantUML/image/${filename || "default.png"}`,
      {
        responseType: "blob",
      }
    );

    return getImageResponse.data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

export default plantUMLImageGenerator;
