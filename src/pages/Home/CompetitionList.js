import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getUpcomingManageableCompetitions,
  getPastManageableCompetitions,
} from '../lib/wcaAPI.js'

const CompetitionLink = ({ comp, ...props }) => (
  <li component={Link} to={`/competitions/${comp.id}`}>
    {comp.name} ({new Date(comp.start_date).toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })})
  </li>
)

const CompetitionList = () => {
  const [upcomingCompetitions, setUpcomingCompetitions] = useState([]);
  const [pastCompetitions, setPastCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUpcomingManageableCompetitions()
      .then(competitions => {
        setUpcomingCompetitions(
          sortBy(competitions, competition => competition['start_date'])
        );
      })
      .catch(error => setError(error.message))
      .finally(() => setLoading(false));

      getPastManageableCompetitions()
        .then(competitions => {
          setPastCompetitions(
            sortBy(competitions, competition => -competition['start_date'])
          );
        })
        .catch(error => setError(error.message))
        .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Typography variant="h4">My Competitions</Typography>

      <div>
        <div inset disableSticky color="primary">Upcoming Competitions</div>

        {upcomingCompetitions.map((comp) =>
          <CompetitionLink key={comp.id} comp={comp}/>
        )}

        <Divider/>

        <div inset disableSticky color="primary">Past Competitions</div>

        {pastCompetitions.map((comp) => 
          <CompetitionLink key={comp.id} comp={comp}/>
        )}
      </div>
    </div>
  );
};

export default CompetitionList;
