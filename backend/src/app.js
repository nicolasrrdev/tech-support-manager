const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const solicitudRoutes = require("./routes/solicitud.routes");
const errorMiddleware = require("./middlewares/error.middleware");

const swaggerDocument = require("../swagger.json");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "TechSupport Manager API funcionando correctamente"
  });
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

app.use("/api/solicitudes", solicitudRoutes);

app.use(errorMiddleware);

module.exports = app;