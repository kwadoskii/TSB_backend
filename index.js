import express from "express";

const app = express();
const PORT = process.env.PORT || 9000;

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.get("/", (_, res) => {
  res
    .status(200)
    .json({
      status: "success",
      data: { message: "Welcome to TSB backend", currentDate: new Date() },
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
