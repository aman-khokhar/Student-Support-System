import React,{ useEffect, useState } from 'react';
import { Card, Placeholder } from 'react-bootstrap';
import { firestore } from '../firebase';
import { onSnapshot, collection } from 'firebase/firestore';

export default function CardTicket({ ticket }) {
  const {status, id, className, labName, problemWith, problem, createdAt, pcNumber} = ticket;
  const [problemLong, setProblemLong] = useState({});
  const  [loadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    const unsubProblem = onSnapshot(collection(firestore, 'problems'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === problemWith) {
          setProblemLong(doc.data());
          setLoadingPage(false);
        }
        return null;
      })
    });
    return unsubProblem;
  }, []);

  function getProblemWithLong() {
    switch(problemWith) {
      case 'pc':
        return 'PC ' + pcNumber;
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

  function getColor(property) {
    if(property === 'border') {
      switch(ticket.status) {
        case 'pending':
          return 'primary';
        case 'underprocess':
          return 'warning';
        case 'resolved':
          return 'dark';
        default:
      }
    } else if(property === 'color') {
      switch(ticket.status) {
        case 'pending':
          return 'blue';
        case 'underprocess':
          return 'orange';
        case 'resolved':
          return 'rgb(169,169,169)';
        default:
    }
    }
  }

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

  return (
    <>
    {
      loadingPage &&
      <>
        <Card className='mb-4'>
          <Placeholder as={Card.Header} animation="wave">
            <Placeholder xs={3} />
          </Placeholder>
          <Card.Body>
            <Placeholder as={Card.Text} animation="wave">
              <Placeholder xs={4} /> <Placeholder xs={2} /> <Placeholder xs={2} />{' '}
              <Placeholder xs={3} /> <Placeholder xs={4} />
              <Placeholder xs={4} /> <Placeholder xs={2} /> <Placeholder xs={2} />{' '}
              <Placeholder xs={3} /> <Placeholder xs={4} />
            </Placeholder>
          </Card.Body>
          <Placeholder as={Card.Footer} animation="wave">
            <Placeholder xs={3} />
          </Placeholder>
        </Card>
      </>
    }
    {
      !loadingPage &&
      <Card className='mb-4' border={getColor('border')}>
        <Card.Header>Ticket ID: {id}</Card.Header>
        <Card.Body>
          {
            labName &&
            <>
              <strong>Lab: </strong>{labName}<br />
            </>
          }
          {
            className &&
            <>
              <strong>Classroom: </strong>{className}<br />
            </>
          }
          <strong>Problem with: </strong>{getProblemWithLong()}<br />
          <strong>Problem: </strong>{
            problem !== 'other' ?
            problemLong[problem] : 
            'Other'
          }<br />
          <small>Created on {createdAt}</small>
        </Card.Body>
        <Card.Footer className="d-flex align-items-center">
          Status: <Dot color={getColor('color')}/> {status}
        </Card.Footer>
      </Card>
    }
    </>
  );
}
