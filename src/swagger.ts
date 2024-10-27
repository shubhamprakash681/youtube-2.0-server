import swaggerAutogen from "swagger-autogen";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;
const node_env = process.env.NODE_ENV || "development";

const getHostname = (): string => {
  if (node_env === "development") {
    return `http://localhost:${port}`;
  }

  if (node_env === "production") {
    return `http://test-server:${port}`;
  }

  return `http://localhost:${port}`;
};

const doc = {
  info: {
    title: "Youtube 2.0 Express API with Swagger",
    description: "Automatically generated Swagger documentation",
  },
  host: getHostname(),
  schemes: ["http"],
};

const outputFile = "../swagger-output.json";
const endpointsFiles = ["./src/app.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger documentation generated!");
});
