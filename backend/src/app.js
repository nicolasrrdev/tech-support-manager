const express = require("express");
const cors = require("cors");

const solicitudRoutes = require("./routes/solicitud.routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "TechSupport Manager API funcionando correctamente"
  });
});

app.use("/api/solicitudes", solicitudRoutes);

app.use(errorMiddleware);

module.exports = app;
