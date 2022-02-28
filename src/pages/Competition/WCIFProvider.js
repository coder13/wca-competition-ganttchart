import { createContext, useContext, useState, useEffect, useReducer } from 'react';
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
    default: {
      throw new Error(`Unhandled action type ${type}`);
    }
  }
}

export default function WCIFProvider({ competitionId, children }) {
  const [ wcif, dispatch ] = useReducer(WCIFReducer, INITIAL_STATE);
  const [ error, setError ] = useState(null);
  const [ fetching, setFetching ] = useState(true);
  const wcaApiFetch = useWCAFetch();

  useEffect(() => {
    wcaApiFetch(`/competitions/${competitionId}/wcif`)
      .then((data) => {
        dispatch({
          type: 'SET',
          payload: data,
        });
        setFetching(false);
      })
      .catch((error) => {
        console.error(error);
        setError(error);
        setFetching(false);
      });
  }, [competitionId, wcaApiFetch]);

  console.log(50, fetching, error, wcif);
  return <WCIFContext.Provider value={{ wcif, error, dispatch }}>{(fetching && !error) ? 'Loading...' : children}</WCIFContext.Provider>
}

export const useWCIF = () => useContext(WCIFContext);
