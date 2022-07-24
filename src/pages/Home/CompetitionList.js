import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useWCAFetch from '../../hooks/useWCAFetch';

const CompetitionLink = ({ comp, ...props }) => (
  <li>
    <Link to={`/competitions/${comp.id}`}>
      {comp.name} ({new Date(comp.start_date).toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })})
    </Link>
  </li>
);

export default function CompetitionList() {
  const wcaApiFetch = useWCAFetch();
  const [upcomingCompetitions, setUpcomingCompetitions] = useState([]);
  const [pastCompetitions, setPastCompetitions] = useState([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState(null);
    
  const getUpcomingManageableCompetitions = useCallback(() => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({
      managed_by_me: true,
      start: oneWeekAgo.toISOString(),
    });
    return wcaApiFetch(`/competitions?${params.toString()}`);
  }, [wcaApiFetch]);
    
  const getPastManageableCompetitions = useCallback(() => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({
      managed_by_me: true,
      end: oneWeekAgo.toISOString(),
    });
    return wcaApiFetch(`/competitions?${params.toString()}`);
  }, [wcaApiFetch]);
  
  useEffect(() => {
    getUpcomingManageableCompetitions()
      .then((competitions) => {
        setUpcomingCompetitions(competitions.sort((a,b) => a.start_date - b.start_date));
      })
      .catch(error => setError(error.message))
      .finally(() => setLoading(false));

      getPastManageableCompetitions()
        .then((competitions) => {
          setPastCompetitions(competitions.sort((a,b) => a.start_date - b.start_date));
        })
        .catch(error => setError(error.message))
        .finally(() => setLoading(false));
  }, [getUpcomingManageableCompetitions, getPastManageableCompetitions]);

  return (
    <div>
      <h2>My Competitions</h2>

      <div>
        <h3>Upcoming Competitions</h3>

        {upcomingCompetitions.map((comp) =>
          <CompetitionLink key={comp.id} comp={comp}/>
        )}

        <hr />

        <h3>Past Competitions</h3>

        {pastCompetitions.map((comp) => 
          <CompetitionLink key={comp.id} comp={comp}/>
        )}
      </div>
    </div>
  );
};
