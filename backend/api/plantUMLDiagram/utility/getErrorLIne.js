const getErrorLine = (error, plantumlCode) => {
  const match = error.match(/Error line (\d+)/);
  if (match) {
    const lineNumber = parseInt(match[1], 10);
    const lines = plantumlCode.split("\n");
    if (lineNumber > 0 && lineNumber <= lines.length) {
      return `Line ${lineNumber}: ${lines[lineNumber - 1]}`;
    }
  }
  return null;
};

module.exports = getErrorLine