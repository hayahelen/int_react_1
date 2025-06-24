import express from 'express';
import cors from 'cors';
import clientRoute from "./routes/clientRoute.js"
import productRoutes from "./routes/productRoutes.js"
import path from 'path'


const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());


// app.use('/api', clientRoute);
app.use("/api", productRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), 'uploads')));




// app.listen(port, () => {
//     console.log("Listening on port 5000...")
// });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));