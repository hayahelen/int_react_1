import express from 'express';
import cors from 'cors';
import clientRoutes from "./routes/clientRoute.js"

import productRoutes from "./routes/productRoutes.js"


const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());


// app.use('/api', productRoutes);
app.use("/api/products", productRoutes);




app.listen(port, () => {
    console.log("Listening on port 3000...")
});

