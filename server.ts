import app from "./src/app";
import { config } from "./src/config/config";

const startServer = () => {

    const port = config.port || 5000;

    app.listen(port, async () => {
        console.log(`listening on port : ${port}`)
    })
}

startServer();