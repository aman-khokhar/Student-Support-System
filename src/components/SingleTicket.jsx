import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase';
import { onSnapshot, collection, doc, setDoc } from 'firebase/firestore';
import { Card, Button, ListGroup, Spinner, Row, Col, FormCheck } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';

export default function SingleTicket({ match }) {
  const { currentUser } = useAuth();
  const role = currentUser.role;
  const ticketid = match.params.ticketid;
  const [ticket, setTicket] = useState({});
  const [loadingPage, setLoadingPage] = useState(true);
  const [problemLong, setProblemLong] = useState([]);
  const [formCheckValue, setFormCheck] = useState('');
  const history = useHistory();

  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, 'tickets'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === ticketid) {
          setTicket(doc.data());
        }
        return null;
      })
    });
    const unsubProblem = onSnapshot(collection(firestore, 'problems'), (snapshot) => {
      setProblemLong(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
      setLoadingPage(false);
    });
    return (unsub, unsubProblem);
  }, []);

  function getProblemWithLong() {
    switch(ticket.problemWith) {
      case 'pc':
        return 'PC ' + ticket.pcNumber;
      case 'ac':
        return 'AC';
      case 'light':
        return 'Light';
      case 'fan':
        return 'Fan';
      case 'bench':
        return 'Bench';
      case 'board':
        return 'Board';
      case 'printer':
        return 'Printer';
      case 'projector':
        return 'Projector';
      case 'tableChair':
        return 'Table or Chair';
      case 'switchBoard':
        return 'Switch board at PC ' + ticket.pcNumber;
      default:
    }
  }

  function getColor() {
    switch(ticket.status) {
      case 'pending':
        return 'blue';
      case 'underprocess':
        return 'orange';
      case 'resolved':
        return 'rgb(169,169,169)';
      default:
        return 'none';
    }
  }

  function Dot({ color }) {
    return (
      <span style={{ 
        display: 'inline-block', 
        margin: '0px 10px',
        width: '10px', 
        height: '10px', 
        borderRadius: '50%', 
        backgroundColor: color,
        marginTop: '3px',
        }}></span>
    );
  }

  async function handleStatusChange() {
    if(!formCheckValue) {
      return;
    }
    let temp = {...ticket};
    temp.status = formCheckValue;
    const docRef = doc(firestore, 'tickets', ticketid);
    const payload = {...temp};
    await setDoc(docRef, payload);
    setFormCheck('');
  }

  return (
    <>
      {
        loadingPage &&
        <>
          <div className='text-center'>
            <Spinner animation='border' /><big><strong><p> Loading</p></strong></big>
          </div>
        </>
      }
      {
        !loadingPage &&
        <>
        {(role === 'student' && currentUser.uid !== ticket.uid) && history.push('/')}
        <Card className='w-75' style={{ margin: 'auto', padding: '10px' }}>
          <Card.Header className="d-flex align-items-center justify-content-center">Ticket ID: {ticketid}</Card.Header>
          <Card.Body>
            <h2 className='text-center mb-4'>Ticket</h2>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <big><strong>Ticket created by: </strong>{ticket.name}</big>
              </ListGroup.Item>
              {
                (role==='hod' || role==='lab-incharge') &&
                <ListGroup.Item>
                  <big><strong>Ticket creator ID: </strong>{ticket.uid}</big>
                </ListGroup.Item>
              }
              <ListGroup.Item>
                {
                  ticket.labName &&
                  <>
                    <big><strong>Problem in: </strong>{ticket.labName}</big>
                  </>
                }
                {
                  ticket.className &&
                  <>
                    <big><strong>Problem in: </strong>{ticket.className}</big>
                  </>
                }
              </ListGroup.Item>
              <ListGroup.Item>
                <big><strong>Problem with: </strong>{getProblemWithLong()}<br /></big>
              </ListGroup.Item>
              <ListGroup.Item>
                <big><strong>Problem: </strong>{
                  ticket.problem !== 'other' ?
                  problemLong.map(element => {
                  if(element.id === ticket.problemWith) {
                    return element[ticket.problem];
                  }
                  }) : 
                  'Other'
                }<br /></big>
              </ListGroup.Item>
              { 
                (ticket.problem === 'other' || ticket.description !== 'None') &&
                <>
                  <ListGroup.Item>
                    <big><strong>Description: </strong>{ticket.description}<br /></big>
                  </ListGroup.Item>
                </>
              }
              <ListGroup.Item className="d-flex align-items-center justify-content-center">
                <small><strong>Created on </strong>{ticket.createdAt}<br /></small>
              </ListGroup.Item>
            </ListGroup>
            {
              (role==='hod' || role==='lab-incharge') &&
              <>
                { 
                  (ticket.status === 'pending'|| ticket.status === 'underprocess') &&
                  <div className='text-center mt-2'>
                    <Row>
                      <Col xs='auto'><big>Change Status:</big></Col>
                      <Col>
                        <FormCheck
                          inline
                          label='Under Process'
                          name='statusGroup'
                          type='radio'
                          id='underprocess'
                          value='underprocess'
                          onChange={(e) => setFormCheck(e.target.value)}
                          disabled={ticket.status === 'underprocess' ? true : false}
                          required  />
                        <FormCheck
                          inline
                          label='Resolved'
                          name='statusGroup'
                          type='radio'
                          id='resolved'
                          value='resolved'
                          onChange={(e) => setFormCheck(e.target.value)}
                          required  />
                      </Col>
                      <Col xs='auto'>
                        <Button 
                          type='submit'
                          className='w-100' 
                          onClick={handleStatusChange} >
                            Change Status
                        </Button>  
                      </Col>
                    </Row>
                  </div>
                }
              </>
            }
          </Card.Body>
          <Card.Footer className="d-flex align-items-center justify-content-center">
            Status: <Dot color={getColor()}/>{ticket.status}
          </Card.Footer>
        </Card>
        </>
      }
    </>
  );
}
