import { Wallet } from './wallet.js';

import express from 'express';
import cors from 'cors';

const app = express();
const port = 3042;

app.use(cors());
app.use(express.json());

const wallets = [new Wallet(100), new Wallet(50), new Wallet(75)]

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const wallet = wallets.find(wallet => wallet.pubKey() == address);
  const balance = wallet && Math.round(wallet.balance * 10000) / 10000 || 0;
  res.send({ balance });
});

app.post('/send', async (req, res) => {
  const {sender, recipient, amount, signature} = req.body;
  
  if (!signature) {
    res.status(500).send({message: 'signature is empty'});
    return;
  }
  const senderWallet = wallets.find(wallet => wallet.pubKey() == sender);
  if (!senderWallet) {
    res.status(500).send({message: 'Sender not found'});
    return;
  }
  const recipientWallet = wallets.find(wallet => wallet.pubKey() == recipient);
  if (!recipientWallet) {
    res.status(500).send({message: 'Recipient not found'});
    return;
  }

  const sig = await senderWallet.signature(sender, recipient, amount);
  const isValid = await senderWallet.verify(sender, recipient, amount, signature);
  console.log("!!!: ", signature);
  console.log("###: ", sig);
  console.log("isValid ", isValid);
  
  if (!isValid) {
    res.status(500).send({message: 'Signature is not valid'});
    return;
  }
  
  senderWallet.balance -= amount;
  recipientWallet.balance += amount;
  
  res.send({ balance: Math.round(senderWallet.balance * 10000) / 10000 });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

