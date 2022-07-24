import { findAssignmentByActivityCode, parseActivityCode } from "./utils";

const AssignmentTypeSortOrder = {
  competitor: 1,
  "staff-scrambler": 2,
  "staff-judge": 3,
  "staff-runner": 4,
};

export const sortByTime = (sortActivityCode) => (a,b) => {
  const {eventId} = parseActivityCode(sortActivityCode);

  const aPRs = a.personalBests.filter((i) => i.eventId === eventId);
  const bPRs = b.personalBests.filter((i) => i.eventId === eventId);

  if (!aPRs.length && !bPRs.length) {
    return a.name.localeCompare(b.name);
  }

  if (!aPRs.length) {
    return 1;
  }

  if (!bPRs.length) {
    return -1;
  }

  const aPRAverage = aPRs.find((pr) => pr.type === 'average');
  const bPRAverage = bPRs.find((pr) => pr.type === 'average');

  if (!aPRAverage && !bPRAverage) {
    const aPRSingle = aPRs.find((pr) => pr.type === 'single');
    const bPRSingle = bPRs.find((pr) => pr.type === 'single');

    return aPRSingle.worldRanking - bPRSingle.worldRanking;
  }

  if (!aPRAverage) {
    return 1;
  }

  if (!bPRAverage) {
    return -1;
  }

  return aPRAverage.worldRanking - bPRAverage.worldRanking;
}

export const sortByGroup = (sortActivityCode) => (a, b) => {
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
}

export const sortByActivityCode = (sortActivityCode, sortType) => (a, b) => {
  switch (sortType) {
    case 'group':
      return sortByGroup(sortActivityCode)(a,b);
    case 'time':
      return sortByTime(sortActivityCode)(a,b);
    default:
      return 1;
  }
}
