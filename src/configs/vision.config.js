const vision = require("@google-cloud/vision");

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

exports.client = new vision.ImageAnnotatorClient({ credentials });
