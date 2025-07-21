import { app } from './app.js'
const PORT = process.env.PORT_BACKEND || 3001
app.listen(PORT, () =>
  console.log(`The server is listening for requests on: http://localhost:${PORT}`),
)
