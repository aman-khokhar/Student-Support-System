import React, { useEffect, useState } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import { firestore } from '../firebase';
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from '../contexts/AuthContext';
import { Link, useHistory } from 'react-router-dom';
import CardTicket from './CardTicket';

function Dot({ color }) {
  return (
    <span style={{ 
      display: 'inline-block', 
      margin: '0px 10px',
      width: '8px', 
      height: '8px', 
      borderRadius: '50%', 
      backgroundColor: color,
      }}></span>
  );
}

export default function TicketsStudent() {
  const removeStuff = {
    textDecoration: 'none',
    color: 'black',
  };

  const [tickets, setTickets] = useState([]);
  const { currentUser } = useAuth();
  const [loadingPage, setLoadingPage] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, 'tickets'), (snapshot) => {
      setTickets(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})).filter(doc => doc.uid===currentUser.uid));
      setLoadingPage(false);
    });
    return unsub;
  }, []);

  return (
    <div>
    {currentUser.role !== 'student' && history.push('/')}
    {
      loadingPage &&
      <>
        <div className='text-center'>
          <Spinner animation='border' /><big><strong><p>Loading</p></strong></big>
        </div>
      </>
    }
    {
      !loadingPage &&
      <Card>
        <Card.Body>
          {
            tickets.length === 0 ? 
            <>
              <p>No tickets created by you yet.</p>
            </> : 
            <>
              {
                tickets.map((ticket, index) => {
                  return(
                  <Link 
                    key={index} 
                    style={removeStuff} 
                    to={`/ticket/${ticket.id}`}
                    params={{ ticketid: ticket.id }}>
                    <CardTicket ticket={ticket}/>
                  </Link>
                )})
              }
            </>
          }
          <hr />
          <p>
          Status: <br />
          <Dot color='blue'/> pending (Ticket has been created successfully.)<br />
          <Dot color='orange'/> underprocess (Ticket is seen by department and are working on it.)<br />
          <Dot color='rgb(169,169,169)'/> resolved (Issue has been resolved.)
          </p>
        </Card.Body>
      </Card>
    }
    </div>
  );
}
