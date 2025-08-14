const express = require("express");
const app = express();
const cors = require("cors");
const paymentsRoutes = require("./routes/payments.routes");
const PORT = 4000;

app.use(express.json());
app.use(cors());

app.use("/api/payments", paymentsRoutes);


app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(PORT, () => {
    console.log(`Server is running on port at http://localhost:${PORT}`);
});