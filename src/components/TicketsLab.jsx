import React, { useEffect, useState } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import { firestore } from '../firebase';
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import CardTicket from './CardTicket';
import { useHistory } from 'react-router-dom';

export default function TicketsLab() {
  const removeStuff = {
    textDecoration: 'none',
    color: 'black',
  };

  const { currentUser } = useAuth();
  const [loadingPage, setLoadingPage] = useState(true);
  const [tickets, setTickets] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, 'tickets'), (snapshot) => {
      setTickets(snapshot.docs.map(doc => ({...doc.data(), id: doc.id}))
      .filter(doc => (doc.labId===currentUser.labId && !doc.classId)));
      setLoadingPage(false);
    });
    return unsub;
  }, []);


  return (
    <>
    {currentUser.role !== 'lab-incharge' && history.push('/')}
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
              <p>No tickets created yet in this lab.</p>
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
        </Card.Body>
      </Card>
    }
    </>
  );
}