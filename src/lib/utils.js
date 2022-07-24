export const acceptedRegistration = ({ registration }) => registration?.status === 'accepted';
export const sortByDate = (a, b) => new Date(a.startTime) - new Date(b.startTime);
export const byWorldRanking = (eventId) => (a, b) => {
  if (!eventId) {
    return 1;
  }

  const aPR = a.personalBests.find((i) => i.eventId.toString() === eventId.toString())?.best
  const bPR =  b.personalBests.find((i) => i.eventId.toString() === eventId.toString())?.best;
  if (aPR && bPR) {
    return aPR - bPR;
  } else {
    return (aPR ? 1 : 0) - (aPR ? 1 : 0)
  }
};

export const unique = (v, i, arr) => {
  // compare index with first element index
  return i === arr.indexOf(v);
};

export const parseActivityCode = (activityCode) => {
  const split = activityCode.split('-');
  return {
    eventId: split[0],
    roundNumber: +split.find((i) => i.startsWith('r'))?.substring(1, 2),
    group: +split.find((i) => i.startsWith('g'))?.substring(1, 2),
  }
}

export const findAssignmentByActivityCode = (assignments, activityCode) => {
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
