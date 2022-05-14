import styled from 'styled-components'
import React, { useState, useMemo } from 'react';
import { acceptedRegistration, sortByDate, byWorldRanking, unique, parseActivityCode } from '../../../lib/utils';
import AssignmentCell from './AssignmentCell';
import AssignmentPicker from './AssignmentPicker';
import { Container, Item } from '../../../components/Grid';

const AssignmentTypeSortOrder = {
  'staff-scrambler': 4,
  'staff-runner': 3,
  'staff-judge': 2,
  'competitor': 1,
};

const findAssignmentByActivityCode = (assignments, activityCode) => {
  const parsedFilterActivityCode = parseActivityCode(activityCode);

  return assignments.find((assignment) => {
    const parsedActivityCode = parseActivityCode(assignment.activityCode);
    const groupMatches = parsedFilterActivityCode.group ? parsedActivityCode.group === parsedFilterActivityCode.group : true;
    const roundMatches = parsedFilterActivityCode.roundNumber ? parsedActivityCode.roundNumber === parsedFilterActivityCode.roundNumber : true;

    const eventIdMatches = parsedActivityCode.eventId === parsedFilterActivityCode.eventId;

    return groupMatches && roundMatches && eventIdMatches;
  });
}

export default function GanttChart({ wcif, room, dispatch }) {
  const [sortActivityCode, setSortActivityCode] = useState(wcif.events[0].id);
  const [assignmentPickerValue, setAssignmentPickerValue] = useState('competitor');
  console.log(7, sortActivityCode);

  const allChildActivities = useMemo(() =>
    room.activities
      .sort(sortByDate)
      .map((activity) => activity.childActivities)
      .reduce((acc, activity) => acc.concat(activity))
    , [room]);

  const firstRoundActivities = useMemo(() =>
    room.activities
      .sort(sortByDate)
      .filter(({ activityCode }) => parseActivityCode(activityCode).roundNumber === 1)
      .map((activity) => activity.childActivities)
      .reduce((acc, activity) => acc.concat(activity))
    , [room]);

  const persons = useMemo(() => wcif.persons
    .sort((a, b) => a.registrantId - b.registrantId)
    .filter(acceptedRegistration)
    .map((person) => ({ // Speeds up code by pre-fetching person's assignments
      ...person,
      assignments: person.assignments.map((assignment) => {
        const activity = allChildActivities.find(({ id }) => id === assignment.activityId);

        return {
          ...assignment,
          ...activity,
          parsedActivityCode: activity ? parseActivityCode(activity.activityCode) : null,
        }
      }),
    }))
    .filter((person) => { // filter people out by activity code
      if (!sortActivityCode) {
        return true;
      }

      return !!findAssignmentByActivityCode(person.assignments, sortActivityCode)
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    // .sort(byWorldRanking(sortActivityCode))
    .sort((a, b) => {
      if (!sortActivityCode) {
        return 1;
      }

      const parsedSortActivityCode = parseActivityCode(sortActivityCode);

      // sort by staff assignment type
      if (parsedSortActivityCode.group) {
        // Sort by job type for that specific group
        const aAssignment = findAssignmentByActivityCode(a.assignments, sortActivityCode);
        const bAssignment = findAssignmentByActivityCode(b.assignments, sortActivityCode);

        const diff = AssignmentTypeSortOrder[bAssignment.assignmentCode] - AssignmentTypeSortOrder[aAssignment.assignmentCode];
        return diff;
      } else {
        // sort by which group they are competing in
        const aAssignment = findAssignmentByActivityCode(a.assignments.filter(({ assignmentCode }) => assignmentCode === 'competitor'), sortActivityCode);
        const bAssignment = findAssignmentByActivityCode(b.assignments.filter(({ assignmentCode }) => assignmentCode === 'competitor'), sortActivityCode);

        console.log(94, aAssignment, bAssignment);
        const diff = (bAssignment?.parsedActivityCode?.groupNumber || 0) - (aAssignment?.parsedActivityCode?.group || 0);
        return diff
      }

      // const aGroup = a.assignments
      //   .map(({ activityId }) => firstRoundActivities.find(({ id }) => id === activityId))
      //   .filter((i) => !!i)
      //   .map(({ activityCode }) => parseActivityCode(activityCode))
      //   .find(({ eventId, group }) => (
      //     eventId === parseActivityCode(sortActivityCode).eventId && (
      //       parseActivityCode(sortActivityCode).group ? parseActivityCode(sortActivityCode).group === group : true
      //     )
      //   ))?.group || 0;

      // const bGroup = b.assignments
      //   .map(({ activityId }) => firstRoundActivities.find(({ id }) => id === activityId))
      //   .filter((i) => !!i)
      //   .map(({ activityCode }) => parseActivityCode(activityCode))
      //   .find(({ eventId, group }) => (
      //     eventId === parseActivityCode(sortActivityCode).eventId && (
      //       parseActivityCode(sortActivityCode).group ? parseActivityCode(sortActivityCode).group === group : true
      //     )
      //   ))?.group || 0;


      return 0;
      // return (bGroup - aGroup) === 0 ? byWorldRanking(sortActivityCode)(a,b) : (bGroup - aGroup);
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

