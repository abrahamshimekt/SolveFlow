const taskDescription = "The following was a task assigned to a student. How confident are you that it was executed according to the instructions? Pay special attention to the tendency of this student to include things that were NOT specifically mentioned in the subject of the instructions."
const responseFormat = "Respond in the form of a JSON array, where the first position represents your confidence from 1 to 10 (10 being the highest) that the instructions were scrupulously respected. In the second position, list recommendations for improvement as a single string. Do not be verbose and only list the recommendations to be applied by the student. Example: Do this, Do that."


const aiEvalUserMessages = {
    taskDescription,
    responseFormat
}

module.exports = aiEvalUserMessages;