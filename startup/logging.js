import "express-async-errors";

export default () => {
  process.on("uncaughtException", (ex) => {
    console.log(`uncaghtException: ${ex}`);
  });

  process.on("unhandledRejection", (ex) => {
    throw ex;
  });
};
