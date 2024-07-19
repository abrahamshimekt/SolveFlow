import React from "react";
const RenderContent = ({ content = "", innerHtmlKey, image ,stepName}) => {
  if (!content?.length) return;
  // replace open/close tags with HTML entities
  let msgHTML = content
    .replace(/\</g, "&lt")
    .replace(/\>/g, "&gt")
    .replace(
      /\`\`\`(.*?)[\n\r]+([^\`]*)\`\`\`/g,
      '<div class="code"><div class="code-language">$1</div><div class="code-options"></div><div class="code-block">$2</div></div>'
    );

  msgHTML = msgHTML.replace(
    /(<div class="code-language">plantuml<\/div><div class=\"code-options\">)(<\/div>)(<div class="code-block">)([^\<\>]+)(?=<\/div><\/div>)/g,
    (m0, m1, m2, m3, m4) => {
      m4.replace(/&lt/g, "<").replace(/&gt/g, ">");

      return `${m1}<button class="seeCode" onclick="switchImage(this);">See code</button><button class="seeImage" onclick="switchImage(this);">See image</button>${m2}<div class="code-img"><img crossOrigin="Anonymous" src="${image}" alt="PlantUML Diagram"></div>${m3}${m4}`;
    }
  );

  msgHTML = msgHTML.replace(
    /(?<=<div class="code-options">)/g,
    `${stepName ? `${stepName} ` : ""}<button onclick="copyCode(this);">Copy</button>`
  );

  msgHTML = msgHTML
    .replace(
      /(<div class="code-block">)([^<>]+)(<\/div>)/g,
      (m0, m1, m2, m3) => {
        return m1 + m2.replace(/([\*\_\[\]\`])/g, "&#8203;$1") + m3;
      }
    )
    .replace(/(?<!&#8203;)([\`]+([^\`]+)[\`]+)/g, "<b>$1</b>")
    .replace(/(?<!&#8203;)([\*]+([^\*]+)[\*]+)/g, "<b>$2</b>")
    .replace(/(?<!&#8203;)([\_]+([^\_]+)[\_]+)/g, "<i>$2</i>")
    .replace(
      /(?<=^|\n|\r)(#+ ?)([^<>\n\r]+)(?=[\n\r])/g,
      (m0, m1, m2) => "<h2>" + m2.trim() + "</h2>"
    )
    .replace(/(?<!&#8203;)(\[([^\[\]]+)\])/g, "<h2>$2</h2>")
    .replace(/[\n\r]+/g, "<br />");

  return (
    <React.Fragment key={innerHtmlKey}>
      <div
        className="msgContent"
        dangerouslySetInnerHTML={{ __html: msgHTML }}
      />
    </React.Fragment>
  );
};

export default RenderContent;
