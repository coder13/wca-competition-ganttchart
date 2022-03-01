import styled from 'styled-components'
import React, { useState } from 'react';
import GanttChart from './GanttChart';
import { useWCIF } from './WCIFProvider';
import RoomSelector from './RoomSelector';

const Container = styled.div`
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const Item = styled.div`
  display: flex;
  flex: ${(props) => props.shrink ? '0' : '1'};
`

export default function CompetitionHome() {
  const { wcif, fetchCompetition, uploadChanges, dispatch } = useWCIF();
  const [ currentVenue, setCurrentVenue ] = useState(wcif.schedule.venues[0].id);
  const [ currentRoom, setCurrentRoom ] = useState(wcif.schedule.venues[0].rooms[0].id);
  const room = wcif.schedule.venues.find(({ id }) => id === currentVenue).rooms.find(({ id }) => id === currentRoom);

  const reset = () => {
    fetchCompetition();
  }

  const save =  () => {
    uploadChanges();
  }

  return (
    <Container>
      <Item shrink row style={{
        backgroundColor: '#CCC',
        padding: '0.5em',
        boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)',
      }}>
        <Item>
          <p>{wcif.name}</p>
        </Item>
        <Item shrink style={{ fontSize: '0.85em' }}>
          <button style={{ width: '10em', margin: '0 0.25em' }} onClick={reset}>Reset & Fetch</button>
          <button style={{ width: '10em', margin: '0 0.25em'  }} onClick={save}>Save & Upload</button>
        </Item>
      </Item>
      <Item style={{ overflowY: 'hidden' }}>
        <GanttChart
          wcif={wcif}
          dispatch={dispatch}
          room={room}
        />
      </Item>
      <Item shrink>
        <RoomSelector
        venues={wcif.schedule.venues}
        currentRoom={currentRoom}
        onRoomChange={(room) => setCurrentRoom(room.id)}
        currentVenue={currentVenue}
        onVenueChange={(venue) => {
          setCurrentVenue(venue.id);
          setCurrentRoom(wcif.schedule.venues.find(({ id }) => id === venue.id).rooms[0].id)
        }}
      />
      </Item>
    </Container>
  );
};

