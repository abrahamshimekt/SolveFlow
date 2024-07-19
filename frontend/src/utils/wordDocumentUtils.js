import plantuml from "plantuml-encoder";
import { marked } from "marked";

const handleDownload = (markDownContent) => {
  return async () => {
    try {
      const codeRegex = /```plantuml\s*@startuml([\s\S]*?)@enduml\s*```/g;
      let match;
      let startIndex = 0;
      let endIndex = 0;
      let processedMarkdown = "";
      while ((match = codeRegex.exec(markDownContent)) !== null) {
        const codeBlock = match[0];
        const codeContent = match[1];

        endIndex = match.index + codeBlock.length;

        processedMarkdown +=
          markDownContent.slice(startIndex, endIndex) + "\n\n";

        const umlUrl =
          "http://www.plantuml.com/plantuml/img/" +
          plantuml.encode(codeContent);
        processedMarkdown += `![PlantUML Diagram](${umlUrl})\n\n`;
        startIndex = endIndex;
      }

      processedMarkdown += markDownContent.slice(endIndex);

      const htmlContent = marked.parse(processedMarkdown);
      const blob = new Blob([htmlContent], { type: "application/msword" });

      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `compiled_content_${Date.now()}.docx`;

      anchor.click();

      URL.revokeObjectURL(url);
      anchor.remove();
    } catch (error) {
      console.error("Error downloading compiled content:", error);
    }
  };
};

export default handleDownload;
