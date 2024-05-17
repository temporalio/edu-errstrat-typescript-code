// Call this via HTTP GET with a URL like:
// http://localhost:9998/getExternalDeliveryDriver

import express, { Request, Response } from 'express';

const app = express();
const port = 9998;

app.get('/getExternalDeliveryDriver', async (req: Request, res: Response) => {
  // Simulate waiting for external services to respond
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Checking UberEats...');

  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Checking Grubhub...');

  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Checking DoorDash... Responded.');

  // Return the response from DoorDash
  res.status(200).json({ service: 'DoorDash' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});