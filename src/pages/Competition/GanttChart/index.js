import React, { useState, useMemo } from "react";
import {
  acceptedRegistration,
  sortByDate,
  parseActivityCode,
} from "../../../lib/utils";
import AssignmentCell from "./AssignmentCell";
import AssignmentPicker from "./AssignmentPicker";
import { Container, Item } from "../../../components/Grid";
import { sortByActivityCode } from "../../../lib/sortUtil";

export const flatten = (arr) => arr.reduce((xs, x) => xs.concat(x), []);

const findAssignmentByActivityCode = (assignments, activityCode) => {
  const parsedFilterActivityCode = parseActivityCode(activityCode);

  return assignments.find((assignment) => {
    if (!assignment.parsedActivityCode) {
      return null;
    }

    const parsedActivityCode = assignment.parsedActivityCode;
    const groupMatches = parsedFilterActivityCode.group
      ? parsedActivityCode.group === parsedFilterActivityCode.group
      : true;
    const roundMatches = parsedFilterActivityCode.roundNumber
      ? parsedActivityCode.roundNumber === parsedFilterActivityCode.roundNumber
      : true;

    const eventIdMatches =
      parsedActivityCode.eventId === parsedFilterActivityCode.eventId;

    return groupMatches && roundMatches && eventIdMatches;
  });
};

export default function GanttChart({ wcif, room, dispatch }) {
  const [sortActivityCode, setSortActivityCode] = useState(wcif.events[0].id);
  const [sortType, setSortType] = useState('group');
  const [assignmentPickerValue, setAssignmentPickerValue] =
    useState("competitor");

    const roundActivities = useMemo(
    () =>
      room.activities.filter(
        ({ activityCode }) => activityCode.indexOf("other") === -1
      ),
    [room.activities]
  );

  const allChildActivities = useMemo(
    () =>
      room.activities
        .sort(sortByDate)
        .map((activity) => activity.childActivities)
        .reduce((acc, activity) => acc.concat(activity)),
    [room]
  );

  const persons = useMemo(
    () =>
      wcif.persons
        .sort((a, b) => a.registrantId - b.registrantId)
        .filter(acceptedRegistration)
        .map((person) => ({
          // Speeds up code by pre-fetching person's assignments
          ...person,
          assignments: person.assignments.map((assignment) => {
            const activity = allChildActivities.find(
              ({ id }) => id === assignment.activityId
            );

            return {
              ...assignment,
              ...activity,
              parsedActivityCode: activity
                ? parseActivityCode(activity.activityCode)
                : null,
            };
          }),
        }))
        .filter((person) => {
          // filter people out by activity code
          if (!sortActivityCode) {
            return true;
          }

          return !!findAssignmentByActivityCode(
            person.assignments,
            sortActivityCode
          );
        })
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => {
          if (!sortActivityCode) {
            return 1;
          }

          return sortByActivityCode(sortActivityCode, sortType)(a,b);
        }),
    [wcif.persons, allChildActivities, sortActivityCode, sortType]
  );

  const handleAssignmentChange = (person, activity) => {
    const currentAssignment = person.assignments.find(
      ({ activityId }) => activityId === activity.id
    )?.assignmentCode;

    if (currentAssignment === assignmentPickerValue) {
      dispatch({
        type: "DELETE_ASSIGNMENT",
        payload: {
          registrantId: person.registrantId,
          activityId: activity.id,
        },
      });
    } else {
      dispatch({
        type: "SET_ASSIGNMENT",
        payload: {
          registrantId: person.registrantId,
          activityId: activity.id,
          assignmentCode: assignmentPickerValue,
        },
      });
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activitiesToShow = useMemo(() =>
    roundActivities.filter(({ childActivities }) => childActivities?.length > 0)
  );

  const groupActivitiesToShow = useMemo(
    () =>
      flatten(
        activitiesToShow.map(({ childActivities }) => childActivities || [])
      ),
    [activitiesToShow]
  );

  const countCompetitorsByAssignment = useMemo(() => {
    const counts = {};
    persons.forEach((person) => {
      person.assignments.forEach((assignment) => {
        const activity = allChildActivities.find((child) => child.id === assignment.activityId);
        if (!activity || sortActivityCode !== activity.activityCode) {
          return;
        }

        if (!counts[assignment.assignmentCode]) {
          counts[assignment.assignmentCode] = 0;
        }

        counts[assignment.assignmentCode] += 1;
      });
    }
    );
    return counts;
  }, [allChildActivities, persons, sortActivityCode])

  return (
    <Container>
      <div style={{ overflowY: "scroll" }}>
        <table
          style={{
            boxSizing: "border-box",
            fontSize: "12px",
            tableLayout: "fixed",
          }}
          cellSpacing="0"
        >
          <thead
            style={{
              border: "1px solid black",
            }}
          >
            <tr>
              <th></th>
              {activitiesToShow.map(({activityCode, childActivities}) => {
                return (
                  <th
                    key={activityCode}
                    colSpan={childActivities?.length}
                    style={{
                      height: "1em",
                      padding: 0,
                    }}
                  >
                    <button
                      style={{
                        display: "flex",
                        flex: 1,
                        width: "100%",
                        height: "100%",
                        justifyContent: "center",
                        backgroundColor:
                          activityCode === sortActivityCode &&
                          "#D6DBDF",
                      }}
                      onClick={() => setSortActivityCode(activityCode === sortActivityCode ? null : activityCode)}
                    >
                      {activityCode}
                    </button>
                  </th>
                );
              })}
            </tr>
            <tr>
              <th
                style={{
                  textAlign: "right",
                  width: "16em",
                  height: "1em",
                  paddingRight: "1em",
                }}
              >
                Name
              </th>
              {groupActivitiesToShow.map(({ id, activityCode }) => {
                const { group } = parseActivityCode(activityCode);
                return (
                  <th
                    key={id}
                    style={{
                      width: "4em",
                      height: "1em",
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    <button
                      style={{
                        display: "flex",
                        flex: 1,
                        width: "100%",
                        height: "100%",
                        justifyContent: "center",
                        backgroundColor:
                          activityCode === sortActivityCode && "#D6DBDF",
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
              {groupActivitiesToShow.map(({ id, startTime }) => {
                return (
                  <th
                    key={id}
                    style={{
                      width: "4em",
                      height: "1em",
                      padding: "0.25em",
                      margin: 0,
                    }}
                  >
                    {new Date(startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
                    textAlign: "right",
                    width: "16em",
                    height: "2em",
                    paddingRight: "1em",
                  }}
                >
                  {person.name}
                </td>
                {groupActivitiesToShow.map((activity) => (
                  <AssignmentCell
                    key={activity.id}
                    person={person}
                    activity={activity}
                    sortActivityCode={sortActivityCode}
                    onClick={() => handleAssignmentChange(person, activity)}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Item column style={{ paddingLeft: "1em", paddingRight: "1em" }}>
        <Item column>
          <p>Info Panel</p>
          <p>Chosen Sort Activity Code: {sortActivityCode}</p>
          <select onChange={(e) => setSortType(e.target.value)} value={sortType}>
            <option value="group">Group</option>
            <option value="time">Time</option>
          </select>
          <p>People: {persons.length}</p>
          <p>Competitors: {countCompetitorsByAssignment.competitor}</p>
          <p>Scramblers: {countCompetitorsByAssignment['staff-scrambler']}</p>
          <p>Judges: {countCompetitorsByAssignment['staff-judge']}</p>
          <p>Runners: {countCompetitorsByAssignment['staff-runner']}</p>
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
}
