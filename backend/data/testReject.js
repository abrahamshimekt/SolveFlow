const Library = require("../models/Library");
const humanCheckerNever = "never";
const humanCheckerThreshold = "threshold";
const humanCheckerAlways = "always";
const humanCheckerDefaultPrompt =
  "The result does not look quite right. Please retry.";
const agentBusinessAnalist = "You are an experienced Business Analyst.";
const agentChecker =
  "You are Senior Business Analyst responsible for checking the work of other Business Analysts";
const agentPlantUML = "You are expert and meticulous PlantUML coder";

const steps = {
  init: {
    title: "Problem Identification",
    order: 1,
    persona: "",
    task: "State original description, make it easy to read",
    input: "\n Description:\n[original]",
    format: "",
    active: true,
    humanCheckerStyle: humanCheckerNever,
    humanCheckerThreshold: 8,
    humanCheckerPrompt: humanCheckerDefaultPrompt,
  },
  summary: {
    title: "Summary",
    order: 2,
    persona: agentBusinessAnalist,
    task: "\n Make the following as succint as possible while keeping all the details necessary Application development",
    input: "\n Description:\n[original]",
    format: "",
    active: true,
    aiChecker: "You are a linguist familiar with application development",
    aiCheckerInstructions: "Check for any loss of important detail.",
    aiCheckerThreshold: 9,
    humanCheckerStyle: humanCheckerAlways,
    humanCheckerThreshold: 8,
    humanCheckerPrompt: humanCheckerDefaultPrompt,
  },
  userRoles: {
    title: "User Roles",
    order: 2,
    persona: agentBusinessAnalist,
    task: "\n Extract all the user roles/Actors from the following description for the purpose of Application development. Do not make references to user not specifically mentionned in the description",
    input: "\n Description:\n[summary]",
    format: "",
    active: true,
    humanCheckerStyle: humanCheckerNever,
    humanCheckerThreshold: 8,
    humanCheckerPrompt: humanCheckerDefaultPrompt,
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
  humanCheckerStyle: step.humanCheckerStyle ,
  humanCheckerPrompt: step.humanCheckerPrompt,
  humanCheckerThreshold: step.humanCheckerThreshold,
}));

const libraryDocument = {
  steps: transformedSteps,
  name: "Test Reject",
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
