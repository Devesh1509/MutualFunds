import express from 'express';
import { model, Schema, connect } from 'mongoose';
import axios from 'axios';

const app = express();

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
connect('mongodb://localhost:27017/mutualfunds')
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error', err));

// Define a Schema and model for mutual fund
const mutualFundsSchema = new Schema({
  nameOfFund: { type: String },
  code: { type: Number },
  category: { type: String },
  lastUpdated: { type: Date, default: Date.now },
  scheme: { type: String },
});

const MutualFund = model('MutualFunds', mutualFundsSchema);

async function fetchData() {
  try {
    const response = await axios.get('https://api.mfapi.in/mf/129420');
    const fund = response.data;

    await MutualFund.updateOne(
     
      {nameOfFund: fund.meta.fund_house},
        {code: fund.meta.scheme_code},
        {category: fund.meta.scheme_category},
        {scheme: fund.meta.scheme_name},
      { upsert: true }
    );
    console.log("fetch executed");
  } catch (error) {
    console.error('Error fetching data', error);
  }
}

// API endpoint to get mutual funds
app.get('/', async (req, res) => {
  await fetchData();
  const funds = await MutualFund.find();
  res.json(funds);
});

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
