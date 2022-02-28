import styled from 'styled-components'
import { parseActivityCode } from '../../../lib/utils';

const TD = styled.td`
  padding: 0.25em;
  text-align: center;
  background-color: ${(props) => props.backgroundColor || 'white'};

  &:hover {
    background-color: #cfcfcf;
  }
`;

const Assignments = {
  'competitor': {
    letter: 'C',
    color: '#2ECC71', // green
  },
  'staff-scrambler': {
    letter: 'S',
    color: '#F1C40F', // yellow
  },
  'staff-runner': {
    letter: 'R',
    color: '#E67E22', // orange
  },
  'staff-judge': {
    letter: 'J',
    color: '#3498DB', // blue
  },
}

export default function AssignmentCell({ person, activity, sortActivityCode, onClick }) {
  const assignment = person.assignments.find((assignment) => assignment.activityId === activity.id);
  const highlight = (() => {
    if (!sortActivityCode) {
      return false;
    }

    const parsedActivityCode = parseActivityCode(activity.activityCode);
    const parsedSortActivityCode = parseActivityCode(sortActivityCode);
    return parsedActivityCode.eventId === parsedSortActivityCode.eventId && (
      parsedSortActivityCode.group ? parsedSortActivityCode.group === parsedActivityCode.group : true
    );
  })();
  const assignmentCode = assignment && Assignments[assignment.assignmentCode];

  return (
    <TD
      backgroundColor={assignmentCode ? assignmentCode.color : ( highlight && '#D6DBDF')}
      className="noselect"
      onClick={onClick}
    >
      {assignmentCode ? assignmentCode.letter : ''}
    </TD>
  )
}
