import React, { useEffect, useState } from 'react';
import { Paper } from '@mui/material';
import { resultsToObjects } from "@tableland/sdk";

import SkeletonPlaceholder from '../common/SkeletonPlaceholder';

function MySendMail({ tablelandMethods, tableName }) {
  const [mails, setMails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMails();
  }, [])

  const loadMails = async () => {
    try{
      setLoading(true);
      const readRes = await tablelandMethods.read(`SELECT * FROM ${tableName} WHERE isCopy='yes';`);
      console.warn(readRes);

      const entries = resultsToObjects(readRes);
      let temp = [];

      for (const { recipient, body, id, dateSent } of entries) {
        console.log(`${body}: ${id}`);
        temp.push({ id, data: body, recipient, dateSent});
      }

      setMails(temp);
      setLoading(false);
    } catch(error) {
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <div>
      {loading
        ? <SkeletonPlaceholder />
        : mails.map(m => (
            <Paper key={m.id} style={{ display: 'flex', padding: '0 1rem', marginBottom: '1rem', cursor: "pointer" }}>
              <p style={{ color: 'grey', marginRight: '.5rem' }}>{m.recipient} - </p>
              <p>{m.dateSent}</p>
            </Paper>
      ))}
    </div>
  )
}

export default MySendMail;