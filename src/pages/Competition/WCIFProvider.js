import { createContext, useContext, useState, useEffect, useReducer, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useWCAFetch from '../../hooks/useWCAFetch';

const INITIAL_STATE = {
  id: undefined,
  name: undefined,
  persons: [],
  events: [],
  schedule: {
    venues: [],
  },
};

const WCIFContext = createContext();

function WCIFReducer(state, { type, payload }) {
  switch (type) {
    case 'SET':
      return {
        ...payload
      }
    case 'SET_ASSIGNMENT':
      return {
        ...state,
        persons: state.persons.map((person) => person.registrantId === payload.registrantId ? ({
          ...person,
          assignments: person.assignments.filter(({ activityId }) => activityId !== payload.activityId).concat([{
            activityId: payload.activityId,
            stationNumber: null,
            assignmentCode: payload.assignmentCode,
          }]),
        }) : person),
      }
    case 'DELETE_ASSIGNMENT':
      return {
        ...state,
        persons: state.persons.map((person) => person.registrantId === payload.registrantId ? ({
          ...person,
          assignments: person.assignments.filter(({ activityId }) => activityId !== payload.activityId),
        }) : person),
      }
    default: {
      throw new Error(`Unhandled action type ${type}`);
    }
  }
}

export default function WCIFProvider({ competitionId, children }) {
  const [wcif, dispatch] = useReducer(WCIFReducer, INITIAL_STATE);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(true);
  const wcaApiFetch = useWCAFetch();

  const fetchCompetition = useCallback(async () => {
    setFetching(true);
    try {
      const data = await wcaApiFetch(`/competitions/${competitionId}/wcif`)
      dispatch({
        type: 'SET',
        payload: data,
      });
      setFetching(false);
    } catch (e) {
      setError(e);
      setFetching(false);
    }
  }, [competitionId, wcaApiFetch]);

  const uploadChanges = useCallback(async () => {
    try {
      wcaApiFetch(`/competitions/${competitionId}/wcif`, {
        method: 'PATCH',
        body: JSON.stringify({
          persons: wcif.persons,
        }),
      });
    } catch (e) {
      console.error(e);
      setError(e);
      setFetching(false);
    }
  }, [wcaApiFetch, competitionId, wcif.persons]);

  useEffect(() => {
    fetchCompetition();
  }, [fetchCompetition]);

  return (
    <WCIFContext.Provider value={{ wcif, fetchCompetition, uploadChanges, error, dispatch }}>
      {fetching && 'Loading...'}
      {error && (
        <div style={{
          padding: '1em'
        }}>
          <h3>Error</h3>
          <p>{error.message}</p>
          <Link to="/">Go back</Link>
        </div>
      )}
      {!fetching && !error && wcif.id ? children : null}
    </WCIFContext.Provider>
  )
}

export const useWCIF = () => useContext(WCIFContext);
