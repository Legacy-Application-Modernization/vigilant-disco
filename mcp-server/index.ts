import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'MCP Server is running' });
});

app.post('/analyze', async (req, res) => {
  
  res.json({ message: 'Analysis endpoint - To be implemented' });
});
app.post('/transform', async (req, res) => {
  
  res.json({ message: 'Transform endpoint - To be implemented' });
});

app.listen(PORT, () => {
  console.log(`MCP Server running on http://localhost:${PORT}`);
});