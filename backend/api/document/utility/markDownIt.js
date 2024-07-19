const MarkdownIt = require("markdown-it");
const md = new MarkdownIt();
const md_alwaysconvert = true; //
const checkAndConvertMarkdown = (content) => {
  if (/^\s*#|^\s*[-*]\s|\[.*\]\(.*\)/.test(content) || md_alwaysconvert) {
    const htmlContent = md.render(content);
    return `++[HTML \`<body>${htmlContent}</body>\`]++`;
  }
  return content;
};

module.exports = checkAndConvertMarkdown;
