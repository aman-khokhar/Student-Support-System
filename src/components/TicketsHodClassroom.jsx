import { collection, onSnapshot } from 'firebase/firestore';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { Card, Spinner, Tabs, Tab } from 'react-bootstrap';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { firestore } from '../firebase';
import CardTicket from './CardTicket';

export default function TicketsHodClassroom() {
  const { currentUser } = useAuth();
  const role = currentUser.role;
  const history = useHistory();
  const [selectedNav, setSelectedNav] = useState('');
  const [tickets, setTickets] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const removeStuff = {
    textDecoration: 'none',
    color: 'black',
  };

  useEffect(() => {
    const unsubTickets = onSnapshot(collection(firestore, 'tickets'), (snapshot) => {
      setTickets(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
    });
    const unsubClassrooms = onSnapshot(collection(firestore, 'classrooms'), (snapshot) => {
      setClassrooms(snapshot.docs.map(doc => doc.data()));
      setLoading(false);
    });
    return (unsubTickets, unsubClassrooms);
  }, []);

  useEffect(() => {
    if(!loading) {
      setSelectedNav(classrooms[0].name);
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
            classrooms &&
            <>
              <Card.Header>
                <Tabs 
                  className='justify-content-center'
                  defaultActiveKey={classrooms[0].name}
                  onSelect={selectKey => setSelectedNav(selectKey)}>
                  {
                    classrooms.sort((a, b) => a.name > b.name ? 1 : -1)
                    .map((classroom, index) => {
                      return(
                        <Tab key={index} eventKey={classroom.name} title={classroom.name}>
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
                  .filter(ticket => ticket.className === selectedNav)
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
