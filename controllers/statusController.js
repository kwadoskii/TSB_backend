const status = (_, res) => {
  return res.status(200).json({
    status: "success",
    message: "TSB servers are up and running!",
    timestamp: new Date(),
  });
};

export default {
  status,
};
