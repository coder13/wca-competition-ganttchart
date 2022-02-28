import React from 'react';
import GanttChart from './GanttChart';
import { useWCIF } from './WCIFProvider';

export default function CompetitionHome() {
  const { wcif, dispatch } = useWCIF();

  return (
    <div style={{ padding: '1em'}}>
      <p>{wcif.name}</p>
      <GanttChart wcif={wcif} dispatch={dispatch} />
    </div>
  );
};

