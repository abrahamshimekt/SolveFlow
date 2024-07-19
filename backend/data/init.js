const Library = require("../models/Library");
const agentBusinessAnalist = "You are an experienced Business Analyst.";
const agentPlantUML = "You are expert and meticulous PlantUML coder";

const steps = {
  init: {
    title: "Problem Identification",
    order: 1,
    persona: "",
    task: "State original description, make it easy to read",
    input: "\n Description:\n[original]",
    format: "",
  },
  summary: {
    title: "Summary",
    order: 2,
    persona: agentBusinessAnalist,
    task: "\n Make the following as succint as possible while keeping all the details necessary Application development",
    input: "\n Description:\n[original]",
    format: "",
  },
  userRoles: {
    title: "User Roles",
    order: 2,
    persona: agentBusinessAnalist,
    task: "\n Extract all the user roles/Actors from the following description for the purpose of Application development. Do not make references to user not specifically mentionned in the description",
    input: "\n Description:\n[summary]",
    format: "",
  },
  bizrules: {
    title: "Business Rules Extraction",
    order: 3,
    persona: agentBusinessAnalist,
    task: "\n Extract all the business rules from the following description for the purpose of Application development. Concentrate on the actual description. Do not make references to items not contain within the description. Rules must not contain contextual elements not meant to dictacte the way the Application will operate. All rules must start either with Application or one of the actors/users. It must followed by  should, must, should not, must not. Review each rule against the original description ",
    input: "\n Description:\n[summary]",
    format: "",
  },
  useCases: {
    title: "Use Cases",
    order: 4,
    persona: agentBusinessAnalist,
    task: "Based on the business rules, determine the applicable uses cases using a canonical format. Do not make references to uses cases implied but not specifically contained within the description. Any implied but not specifically mentioned case should stated as a precondition. The only actors that should be mentioned are the user roles identified below. Assume the Application will automatically do its best to only present sensical choices to user. Group use cases whenever possible when similar actions are performed by the same actors",
    input: "\n Business Rules:\n[previous]" + "\n User Roles:\n[userRoles]",
    format: "",
  },
  activityDiagram: {
    title: "Activity Diagram",
    order: 5,
    persona: agentPlantUML,
    task: "Create an activity diagram using plantUML syntax, theme cerulean-outline, creole synatx. Only output the plant UML code nothing else",
    input: "\n Use Cases:\n[useCases]",
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
  name: "Init",
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
