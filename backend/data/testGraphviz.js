const Library = require("../models/Library");
const agentPlantUML = "You are expert and meticulous PlantUML coder";

const steps = {
  classDiagram: {
    title: "Class Diagram",
    order: 1,
    persona: agentPlantUML,
    task: "Create a class diagram using plantUML syntax, theme cerulean-outline, creole synatx. Only output the plant UML code nothing else",
    input: "\n Description:\n[original]",
    format: "",
  },
  componentDiagram: {
    title: "Component Diagram",
    order: 1,
    persona: agentPlantUML,
    task: "Create a component diagram using plantUML syntax, theme cerulean-outline, creole synatx. Only output the plant UML code nothing else",
    input: "\n Description:\n[original]",
    format: "",
  },
  useCaseDiagram: {
    title: "Use Case Diagram",
    order: 1,
    persona: agentPlantUML,
    task: "Create a use case diagram using plantUML syntax, theme cerulean-outline, creole synatx. Only output the plant UML code nothing else",
    input: "\n Description:\n[original]",
    format: "",
  },
  objectDiagram: {
    title: "Object Diagram",
    order: 1,
    persona: agentPlantUML,
    task: "Create an object diagram using plantUML syntax, theme cerulean-outline, creole synatx. Only output the plant UML code nothing else",
    input: "\n Description:\n[original]",
    format: "",
  },
  deploymentDiagram: {
    title: "Deployment Diagram",
    order: 1,
    persona: agentPlantUML,
    task: "Create a deployment diagram using plantUML syntax, theme cerulean-outline, creole synatx. Only output the plant UML code nothing else",
    input: "\n Description:\n[original]",
    format: "",
  },
  stateDiagram: {
    title: " State Diagram",
    order: 1,
    persona: agentPlantUML,
    task: "Create a state diagram using plantUML syntax, theme cerulean-outline, creole synatx. Only output the plant UML code nothing else",
    input: "\n Description:\n[original]",
    format: "",
  },
  legacyActivityDiagram: {
    title: "Legacy Activity Diagram",
    order: 1,
    persona: agentPlantUML,
    task: "Create a Legacy Activity diagram using plantUML syntax, theme cerulean-outline, creole synatx. Only output the plant UML code nothing else",
    input: "\n Description:\n[original]",
    format: "",
  }
 
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
  name: "Test Graphviz",
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
