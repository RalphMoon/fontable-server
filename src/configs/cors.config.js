const { CLIENT_URI, CLIENT_LOCAL_URI, NODE_ENV } = process.env;

const whitelist = [CLIENT_URI, CLIENT_LOCAL_URI];

exports.corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || NODE_ENV === "test") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
