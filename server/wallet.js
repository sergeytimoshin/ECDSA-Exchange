import * as secp from "@noble/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";
import { bytesToHex } from "@noble/hashes/utils";

export class Wallet {
  constructor(balance) {
    const key = secp.utils.randomPrivateKey();
    this.privateKey = Buffer.from(key).toString("hex");
    this.balance = balance;
    console.log("Key:", {
      private: this.privateKey,
      public: this.pubKey(),
      balance: this.balance,
    });
  }

  pubKey() {
    let key = secp.getPublicKey(this.privateKey);
    key = Buffer.from(key).toString("hex");
    key = "0x" + key.slice(key.length - 40);
    return key;
  }

  async signature(sender, recipient, amount) {
    const messageHash = this.messageHash(sender, recipient, amount);
    const signature = await secp.sign(messageHash, this.privateKey);
    return secp.utils.bytesToHex(signature);
  }

  async verify(sender, recipient, amount, signature) {
    try {
      const msgHash = this.messageHash(sender, recipient, amount);
      const recoveredPublicKey = secp.recoverPublicKey(msgHash, signature, 1);
      const isVerified = secp.verify(signature, msgHash, recoveredPublicKey);
      return isVerified;

      // const sig = secp.Signature.fromHex(signature);
      // // const recoveredPubKey = secp.recoverPublicKey(messageHash, sig);
      // // console.log("Recovered pub key: ", recoveredPubKey);
      // const isValid = secp.verify(sig, messageHash, pubkey);
      // return isValid;
    } catch (error) {
      console.log("Error, can't parse sig: ", error);
      return false;
    }
  }

  messageHash(sender, recipient, amount) {
    const json = JSON.stringify({ sender, recipient, amount })
    return bytesToHex(keccak_256(json));
  }
}
