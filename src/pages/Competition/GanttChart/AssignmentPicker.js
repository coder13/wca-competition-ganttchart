import { useEffect } from 'react';
import { Item } from '../../../components/Grid';

const Options = [{
  name: 'Competitor',
  value: 'competitor',
  color: 'green',
}, {
  name: 'Judge',
  value: 'staff-judge',
  color: 'blue',
}, {
  name: 'Runner',
  value: 'staff-runner',
  color: 'orange',
}, {
  name: 'Scrambler',
  value: 'staff-scrambler',
  color: 'yellow',
}];

export default function AssignmentPicker({ currentAssignment, onValueChanged}) {

  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'c':
          onValueChanged('competitor');
          break;
        case 'j':
          onValueChanged('staff-judge');
          break;
        case 'r':
          onValueChanged('staff-runner');
          break;
        case 's':
          onValueChanged('staff-scrambler');
          break;
        default:

      }
    });

    return () => {
      window.removeEventListener('keydown');
    }
  }, [onValueChanged]);

  return (
    <Item shrink>
        {Options.map((option) => (
          <label key={option.value}>
            <input
              type="radio"
              value={option.value}
              name={option.name}
              checked={ currentAssignment === option.value }
              onChange={ () => {
                if (currentAssignment !== option.value) {
                  onValueChanged(option.value);
                }
              }}
            />
            {option.name}
          </label>
        ))}
    </Item>
  );
}