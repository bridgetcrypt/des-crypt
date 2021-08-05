var express = require("express");
const desRouter = require("./routers/des");

const app = express();
app.use(express.json());
const port = process.env.PORT;

app.use(desRouter);

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
