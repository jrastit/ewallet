import './pre-start'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';


// Start the server
const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "localhost"
app.listen(port, host, () => {
  logger.info('Express server started on port: ' + port);
});