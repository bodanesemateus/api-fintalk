import express, { Request, Response } from 'express';
import transactionsRouter from './routes/transactions';

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api', transactionsRouter);

app.get('/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello World!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});