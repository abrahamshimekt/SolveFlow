import { useEffect, useState } from "react";
import { Typography } from "antd";
import styles from "../Pages/ProblemConversation/ProblemConversation.module.scss";
import RenderContent from "./renderContent";
import { getCookie } from "../utils/helper";
import setAuthToken from "../utils/setAuthToken";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { BASE_URL } from "../Config";
import plantUMLImageGenerator from "../utils/plantUMLCodeToImageGenerator";

const PlantUMLCodeCorrector = ({
  componentKey,
  content,
  title,
  chats,
  conversationId,
  userId,
  language,
  isWritting,
  setIsWritting
}) => {
  const [newContent, setNewContent] = useState(content);
  const [innerHtmlKey, setInnerHtmlKey] = useState("");
  const [image, setImage] = useState(null);


  useEffect(() => {
    const token = getCookie("token");
    setAuthToken(token);
    const newUUID = uuidv4();
    setInnerHtmlKey(newUUID);

    const processContent = async () => {
      const codeRegex = /```plantuml\s*@startuml([\s\S]*?)@enduml\s*```/g;
      let match;
      let updatedContent = content;

      const { _id, stepId } = chats[chats.length - 1].data?.library;

      let codeError = "";
      while ((match = codeRegex.exec(content)) !== null) {
        let code = match[0];
        let correctedCode = code;
        try {
          const response = await axios.post(`${BASE_URL}/api/user/plantUML/check`, {
            plantumlCode: code,
            userId,
          });
          codeError = response?.data?.data;
        } catch (error) {
          console.log("Error:", error);
          break;
        }

        if (codeError?.includes("PlantUML syntax error found")) {
          try {
            let axiosResponse = await axios.post(
              `${BASE_URL}/api/user/chats/aicodeCorrector`,
              {
                code,
                codeError,
                language,
                conversationId,
                libraryId: _id,
                stepId,
                action: "Code Error Correction",
                debugLevel: 0,
              }
            );
            correctedCode = axiosResponse.data;
          } catch (axiosError) {
            console.log("error", axiosError);
            break;
          }
        }
        updatedContent = updatedContent.replace(code, correctedCode);

        const imageData = await plantUMLImageGenerator(correctedCode, userId);
        let imageUrl = "";
        if (imageData) {
          imageUrl = URL.createObjectURL(new Blob([imageData]));
        }
        setImage(imageUrl);
      }
      setNewContent(updatedContent);
      setIsWritting(false);
    };

    processContent();
  }, [content]);

  return (
    <div key={componentKey}>
      {isWritting ? (
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
        <>
          <Typography.Paragraph className={styles.paragraph1}>
            {title} - <i>{`{step_${componentKey}}`.toUpperCase()}</i>
          </Typography.Paragraph>
          <Typography.Paragraph className={styles.paragraph2}>
            <RenderContent
              content={newContent}
              innerHtmlKey={innerHtmlKey}
              image={image}
              stepName={`{%${componentKey}}`.toUpperCase()}
            />
          </Typography.Paragraph>
        </>
      )}
    </div>
  );
};

export default PlantUMLCodeCorrector;
