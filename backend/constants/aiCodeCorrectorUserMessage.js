const plantUmlErrorCorrectionInstructions = `Correct any errors in the PlantUML code provided. Please format your response by wrapping any code content in triple backticks with the programming language specified, as shown in the example below. Make sure to follow this format strictly.
    \`\`\`plantuml
    code content
    \`\`\`
    Nothing else.
    `;

const aiCodeCorrectorUserMessage = {
    plantUmlErrorCorrectionInstructions
}

module.exports = aiCodeCorrectorUserMessage;
