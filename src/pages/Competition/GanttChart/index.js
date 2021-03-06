import React, { useState, useMemo } from "react";
import {
  acceptedRegistration,
  sortByDate,
  unique,
  parseActivityCode,
} from "../../../lib/utils";
import AssignmentCell from "./AssignmentCell";
import AssignmentPicker from "./AssignmentPicker";
import { Container, Item } from "../../../components/Grid";

const AssignmentTypeSortOrder = {
  competitor: 1,
  "staff-scrambler": 2,
  "staff-judge": 3,
  "staff-runner": 4,
};

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

  const firstRoundGroupActivities = useMemo(
    () =>
      roundActivities
        .sort(sortByDate)
        .filter(
          ({ activityCode }) =>
            parseActivityCode(activityCode).roundNumber === 1
        )
        .map((activity) => activity.childActivities)
        .reduce((acc, activity) => acc.concat(activity)),
    [roundActivities]
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

          const parsedSortActivityCode = parseActivityCode(sortActivityCode);

          // sort by staff assignment type
          if (parsedSortActivityCode.group) {
            // Sort by job type for that specific group
            const aAssignment = findAssignmentByActivityCode(
              a.assignments,
              sortActivityCode
            );
            const bAssignment = findAssignmentByActivityCode(
              b.assignments,
              sortActivityCode
            );

            const diff =
              AssignmentTypeSortOrder[aAssignment.assignmentCode] -
              AssignmentTypeSortOrder[bAssignment.assignmentCode];
            return diff;
          } else {
            // sort by which group they are competing in
            const aAssignment = findAssignmentByActivityCode(
              a.assignments.filter(
                ({ assignmentCode }) => assignmentCode === "competitor"
              ),
              sortActivityCode
            );
            const bAssignment = findAssignmentByActivityCode(
              b.assignments.filter(
                ({ assignmentCode }) => assignmentCode === "competitor"
              ),
              sortActivityCode
            );

            const diff =
              (aAssignment?.parsedActivityCode?.group || 0) -
              (bAssignment?.parsedActivityCode?.group || 0);

            return diff;
          }
        }),
    [wcif.persons, sortActivityCode, allChildActivities]
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
              {activitiesToShow.map((activity) => {
                const { eventId } = parseActivityCode(activity.activityCode);

                return (
                  <th
                    key={activity.activityCode}
                    colSpan={activity.childActivities?.length}
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
                          activity.activityCode === sortActivityCode &&
                          "#D6DBDF",
                      }}
                      onClick={() => {
                        if (activity.activityCode === sortActivityCode) {
                          setSortActivityCode(null);
                        } else {
                          setSortActivityCode(activity.activityCode);
                        }
                      }}
                    >
                      {activity.activityCode}
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
}
