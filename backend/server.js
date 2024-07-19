const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const passport = require("passport");
const expressSession = require("express-session");

require("dotenv").config();
require("./middleware/passport");

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

app.use(
  cors({
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
  })
);
app.use(bodyParser.json());

app.use(
  expressSession({
    resave: false,
    saveUninitialized: true,
    secret: process.env.JWT_SECRET,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Server running");
});

app.use("/api/auth", require("./api/auth/index"));
app.use("/api/user", require("./api/user/index"));
app.use("/api/user/problems", require("./api/user/problems"));
app.use("/api/user/chats", require("./api/user/chat"));
app.use("/api/user/library", require("./api/user/library"));
app.use("/api/user/threads", require("./api/user/threads"));
app.use("/api/user/logs", require("./api/user/log"));
app.use("/api/user/conversations", require("./api/user/conversation"));
app.use("/api/user/plantUML",require("./api/plantUMLDiagram/plantUMLCodeErrorChecker"));
app.use("/api/user/plantUML",require("./api/plantUMLDiagram/plantUMLDiagramGenerator"));
app.use("/api/user/document",require("./api/document/mergeDocument"))



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
