import React, { useState } from 'react';
import { acceptedRegistration, sortByDate, byWorldRanking, unique, parseActivityCode } from '../../../lib/utils';
import AssignmentCell from './AssignmentCell';

export default function GanttChart({ wcif, dispatch }) {
  const [ sortActivityCode, setSortActivityCode ] = useState(wcif.events[0].id);
  console.log(7, sortActivityCode);
  const firstRoundActivities = wcif.schedule.venues[0].rooms[0].activities
    .sort(sortByDate)
    .filter(({ activityCode }) => parseActivityCode(activityCode).roundNumber === 1)
    .map((activity) => activity.childActivities)
    .reduce((acc, activity) => acc.concat(activity));

  const persons = wcif.persons
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

  const events = firstRoundActivities.map((activity) => activity.activityCode.split('-')[0]).filter(unique);

  const handleAssignmentChange = (person, activity) => {
    dispatch({
      type: 'SET_ASSIGNMENT',
      payload: {
        registrantId: person.registrantId,
        activityId: activity.id,
        assignmentCode: 'competitor',
      },
    });
  }

  return (
    <table style={{ boxSizing: 'border-box', fontSize: '12px' }} cellspacing="0">
      <thead>
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
                  width: '2em',
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
  );
};

