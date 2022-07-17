import React, { useEffect, useState } from 'react';
import { resultsToObjects } from "@tableland/sdk";
import LitJsSdk from 'lit-js-sdk';

import { dataURItoBlob } from '../../helpers/convertMethods';

function Mail({ tablelandMethods, tableName }) {
  const [mails, setMails] = useState([]);

  useEffect(() => {
    loadMails();
  }, [])

  const loadMails = async () => {
    const readRes = await tablelandMethods.read(`SELECT * FROM ${tableName};`);
    console.log(readRes);

    const entries = resultsToObjects(readRes);
    let temp = [];

    for (const { name, id } of entries) {
      console.log(`${name}: ${id}`);
      const text = await messageToDecrypt(name);
      temp.push({ id, name: text});
    }

    setMails(temp);
  }

  const messageToDecrypt = async (cid) => {
    try{
      const chain = 'ethereum';
      const authSig = await LitJsSdk.checkAndSignAuthMessage({chain});
      const accessControlConditions = [
        {
          contractAddress: '',
          standardContractType: '',
          chain: 'ethereum',
          method: 'eth_getBalance',
          parameters: [':userAddress', 'latest'],
          returnValueTest: {
            comparator: '>=',
            value: '0',  // 0 ETH, so anyone can open
          },
        },
      ];

      let data = await fetch(`https://${cid}.ipfs.dweb.link/metadata.json`);
      data = await data.json();
      console.log(data);

      const toDecrypt = LitJsSdk.uint8arrayToString(new Uint8Array(data.encryptedSymmetricKey), 'base16');
      console.log("toDecrypt:", toDecrypt);

      // <Uint8Array(32)> _symmetricKey 
      const _symmetricKey = await window.litNodeClient.getEncryptionKey({
        accessControlConditions,
        toDecrypt,
        chain,
        authSig
      })

      console.warn("_symmetricKey:", _symmetricKey);

      // <String> decryptedString
      const decryptedString = await LitJsSdk.decryptString(
        dataURItoBlob(data.encryptedString),
        _symmetricKey
      );

      console.warn("decryptedString:", decryptedString);
      return decryptedString;
    } catch (error) {
      console.error(error);
    } 
  }

  return (
    <div>
      {mails.map(m => (
        <p key={m.id}>{m.name}</p>
      ))}
    </div>
  )
}

export default Mail;