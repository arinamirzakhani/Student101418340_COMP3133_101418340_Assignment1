require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const { validationResult } = require("express-validator");
const multer = require("multer");

const connectDB = require("./config/db");
const cloudinary = require("./config/cloudinary");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const auth = require("./middleware/auth");
const { signupValidators } = require("./validators/userValidators");
const { employeeValidators } = require("./validators/employeeValidators");

const app = express();
app.use(cors());
app.use(express.json());
app.use(auth); // attaches req.user

// Multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

// REST endpoint to upload employee photo to Cloudinary
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const b64 = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "comp3133_assignment1_employees",
    });

    return res.json({
      success: true,
      message: "Uploaded",
      photoUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Optional: validation endpoints (to show express-validator usage clearly)
// (You can screenshot this too if your prof likes it)
app.post("/validate/signup", signupValidators, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  res.json({ success: true, message: "Valid signup body" });
});

app.post("/validate/employee", employeeValidators, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  res.json({ success: true, message: "Valid employee body" });
});

async function start() {
  await connectDB(process.env.MONGODB_URI);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ user: req.user }),
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`✅ Server running: http://localhost:${PORT}`);
    console.log(`✅ GraphQL: http://localhost:${PORT}${server.graphqlPath}`);
  });
}

start();

