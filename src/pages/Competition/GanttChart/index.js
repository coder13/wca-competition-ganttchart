import styled from 'styled-components'
import React, { useState, useMemo } from 'react';
import { acceptedRegistration, sortByDate, byWorldRanking, unique, parseActivityCode } from '../../../lib/utils';
import AssignmentCell from './AssignmentCell';
import AssignmentPicker from './AssignmentPicker';
import { Container, Item } from '../../../components/Grid';

export default function GanttChart({ wcif, room, dispatch }) {
  const [ sortActivityCode, setSortActivityCode ] = useState(wcif.events[0].id);
  const [ assignmentPickerValue, setAssignmentPickerValue ] = useState('competitor');
  console.log(7, sortActivityCode);
  const firstRoundActivities = useMemo(() =>
    room.activities
      .sort(sortByDate)
      .filter(({ activityCode }) => parseActivityCode(activityCode).roundNumber === 1)
      .map((activity) => activity.childActivities)
      .reduce((acc, activity) => acc.concat(activity))
  , [room]);

  const persons = useMemo(() => wcif.persons
    .sort((a,b) => a.registrantId - b.registrantId)
    .filter(acceptedRegistration)
    .filter((person) => sortActivityCode ? person.registration.eventIds.indexOf(parseActivityCode(sortActivityCode).eventId) > -1 : true)
    .sort((a,b) => a.name.localeCompare(b.name))
    // .sort(byWorldRanking(sortActivityCode))
    .sort((a,b) => {
      if (!sortActivityCode) {
        return 1;
      }

      const aGroup = a.assignments
        .filter(({ assignmentCode }) => assignmentCode === 'competitor')
        .map(({ activityId }) => firstRoundActivities.find(({ id }) => id === activityId))
        .filter((i) => !!i)
        .map(({ activityCode }) => parseActivityCode(activityCode))
        .find(({ eventId, group }) => (
          eventId === parseActivityCode(sortActivityCode).eventId && (
            parseActivityCode(sortActivityCode).group ? parseActivityCode(sortActivityCode).group === group : true
          )
        ))?.group || 0;

      const bGroup = b.assignments
        .filter(({ assignmentCode }) => assignmentCode === 'competitor')
        .map(({ activityId }) => firstRoundActivities.find(({ id }) => id === activityId))
        .filter((i) => !!i)
        .map(({ activityCode }) => parseActivityCode(activityCode))
        .find(({ eventId, group }) => (
          eventId === parseActivityCode(sortActivityCode).eventId && (
            parseActivityCode(sortActivityCode).group ? parseActivityCode(sortActivityCode).group === group : true
          )
        ))?.group || 0;

      return (bGroup - aGroup) === 0 ? byWorldRanking(sortActivityCode)(a,b) : (bGroup - aGroup);
    })
  , [wcif.persons, sortActivityCode, firstRoundActivities]);

  const events = firstRoundActivities.map((activity) => activity.activityCode.split('-')[0]).filter(unique);

  const handleAssignmentChange = (person, activity) => {
    const currentAssignment = person.assignments.find(({ activityId }) => activityId === activity.id)?.assignmentCode;

    if (currentAssignment === assignmentPickerValue) {
      dispatch({
        type: 'DELETE_ASSIGNMENT',
        payload: {
          registrantId: person.registrantId,
          activityId: activity.id,
        },
      });
    } else {
      dispatch({
        type: 'SET_ASSIGNMENT',
        payload: {
          registrantId: person.registrantId,
          activityId: activity.id,
          assignmentCode: assignmentPickerValue,
        },
      });
    }
  }

  return (
    <Container>
      <div style={{ overflowY: 'scroll' }}>
        <table style={{ boxSizing: 'border-box', fontSize: '12px', tableLayout: 'fixed' }} cellSpacing="0">
          <thead style={{
            border: '1px solid black'
          }}>
            <tr>
              <th></th>
              {events.map((eventId) => (
                <th
                  key={eventId}
                  colSpan={firstRoundActivities.filter(({ activityCode }) => activityCode.split('-')[0] === eventId).length}
                  style={{
                    height: '1em',
                    padding: 0,
                  }}
                >
                  <button
                    style={{
                      display: 'flex',
                      flex: 1,
                      width: '100%',
                      height: '100%',
                      justifyContent: 'center',
                      backgroundColor: eventId === sortActivityCode && '#D6DBDF',
                    }}
                    onClick={() => {
                      if (eventId === sortActivityCode) {
                        setSortActivityCode(null);
                      } else {
                        setSortActivityCode(eventId);
                      }
                    }}
                  >
                    {eventId}
                  </button>
                </th>
              ))}
            </tr>
            <tr>
              <th style={{ textAlign: 'right', width: '16em', height: '1em', paddingRight: '1em', }}>Name</th>
              {firstRoundActivities.map(({ id, activityCode }) => {
                const { group } = parseActivityCode(activityCode);
                return (
                  <th
                    key={id}
                    style={{
                      width: '4em',
                      height: '1em',
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    <button
                      style={{
                        display: 'flex',
                        flex: 1,
                        width: '100%',
                        height: '100%',
                        justifyContent: 'center',
                        backgroundColor: activityCode === sortActivityCode && '#D6DBDF',
                        padding: 0,
                        margin: 0,
                      }}
                      onClick={() => {
                        if (activityCode === sortActivityCode) {
                          setSortActivityCode(null);
                        } else {
                          setSortActivityCode(activityCode);
                        }
                      }}
                    >
                      {group}
                    </button>
                  </th>
                );
              })}
            </tr>
            <tr>
              <th>Time</th>
              {firstRoundActivities.map(({ id, startTime }) => {
                return (
                  <th
                    key={id}
                    style={{
                      width: '4em',
                      height: '1em',
                      padding: '0.25em',
                      margin: 0,
                    }}
                  >
                    {new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {persons.map((person) => (
              <tr key={person.registrantId}>
                <td
                  style={{
                    textAlign: 'right',
                    width: '16em', 
                    height: '2em',
                    paddingRight: '1em',
                  }}
                >
                  {person.name}
                </td>
                {firstRoundActivities.map((activity) =>
                  <AssignmentCell
                    key={activity.id}
                    person={person}
                    activity={activity}
                    sortActivityCode={sortActivityCode}
                    onClick={() => handleAssignmentChange(person, activity)}
                  />
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Item column style={{ paddingLeft: '1em', paddingRight: '1em' }}>
        <Item column>
          <p>Info Panel</p>
          <p>Chosen Sort Activity Code: {sortActivityCode}</p>
          <p>People: {persons.length}</p>
          <p>Scramblers: {2}</p>
        </Item>
        <Item column>
          <p>Assignment Painter</p>
          <p>Assignment: </p>
          <AssignmentPicker
            currentAssignment={assignmentPickerValue}
            onValueChanged={setAssignmentPickerValue}
          />
        </Item>
      </Item>
    </Container>
  );
};

