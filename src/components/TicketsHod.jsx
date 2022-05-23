import { collection, onSnapshot } from 'firebase/firestore';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { Card, Spinner, Tabs, Tab } from 'react-bootstrap';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { firestore } from '../firebase';
import CardTicket from './CardTicket';

export default function TicketsHod() {
  const { currentUser } = useAuth();
  const role = currentUser.role;
  const history = useHistory();
  const [selectedNav, setSelectedNav] = useState('');
  const [tickets, setTickets] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const removeStuff = {
    textDecoration: 'none',
    color: 'black',
  };

  useEffect(() => {
    const unsubTickets = onSnapshot(collection(firestore, 'tickets'), (snapshot) => {
      setTickets(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
    });
    const unsubLabs = onSnapshot(collection(firestore, 'labs'), (snapshot) => {
      setLabs(snapshot.docs.map(doc => doc.data()));
      setLoading(false);
    });
    return (unsubTickets, unsubLabs);
  }, []);

  useEffect(() => {
    if(!loading) {
      setSelectedNav(labs[0].name);
    }
  }, [loading])

  return (
    <>
      {role !== 'hod' && history.push('/')}
      {
        loading &&
        <>
          <div className='text-center'>
            <Spinner animation='border' /><big><strong><p>Loading</p></strong></big>
          </div>
        </>
      }
      {
        !loading &&
        <Card>
          {
            labs &&
            <>
              <Card.Header>
                <Tabs 
                  className='justify-content-center'
                  defaultActiveKey={labs[0].name}
                  onSelect={selectKey => setSelectedNav(selectKey)}>
                  {
                    labs.sort((a, b) => a.name > b.name ? 1 : -1)
                    .map((lab, index) => {
                      return(
                        <Tab key={index} eventKey={lab.name} title={lab.name}>
                        </Tab>
                      );
                    })
                  }
                </Tabs>
              </Card.Header>
              <Card.Body>
                {
                  !tickets &&
                  <big>No Tickets to manage.</big>
                }
                {
                  tickets
                  .filter(ticket => ticket.labName === selectedNav)
                  .map((ticket, index) => {
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
              </Card.Body>
            </>
          }
        </Card>
      }
    </>
  );
}
