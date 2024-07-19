const Library = require("../models/Library");
const agentPlantUML = "You are expert and meticulous PlantUML coder";

const steps = {
  activityDiagram: {
    title: "Activity Diagram",
    order: 1,
    persona: agentPlantUML,
    task: "Create an activity diagram using plantUML syntax, theme cerulean-outline, creole synatx. Only output the plant UML code nothing else",
    input: "\n Description:\n[original]",
    format: "",
  },
};

const transformedSteps = Object.entries(steps).map(([key, step]) => ({
  key,
  title: step.title,
  order: step.order,
  persona: step.persona,
  task: step.task,
  input: step.input,
  format: step.format,
  active: step.active,
  aiChecker: step.aiChecker,
  aiCheckerInstructions: step.aiCheckerInstructions,
  aiCheckerThreshold: step.aiCheckerThreshold,
  humanCheckerStyle: step.humanCheckerStyle,
  humanCheckerPrompt: step.humanCheckerPrompt,
  humanCheckerThreshold: step.humanCheckerThreshold,
}));

const libraryDocument = {
  steps: transformedSteps,
  name: "Simple PlantUML Diagram",
  created_at: new Date(),
  updated_at: new Date(),
};

const seeder = Library.create(libraryDocument)
  .then((doc) => {
    console.log("Document inserted successfully:", doc);
  })
  .catch((err) => {
    console.error("Error inserting document:", err);
  });

module.exports = seeder;
