import { Button, Card, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useHistory, Link } from 'react-router-dom';
import { firestore } from '../firebase';
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Classrooms() {
  const { currentUser } = useAuth();
  const role = currentUser.role;
  const history = useHistory();
  const [loadingPage, setLoadingPage] = useState(true);
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, 'classrooms'),(snapshot) => {
      setClassrooms(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
      setLoadingPage(false);
    });
    return unsub;
  }, []);


  return (
    <>
      {(role === 'student' || role === 'lab-incharge' || role === 'hod') && history.push('/')}
      {
        loadingPage &&
        <>
          <div className='text-center'>
            <Spinner animation='border' /><big><strong><p> Loading</p></strong></big>
          </div>
        </>
      }
      {
        (role === 'resource-manager' && !loadingPage) && 
        <Card className='w-50' style={{ margin: 'auto', padding: '10px' }}>
          <Card.Body>
            {
              classrooms.length < 1 && 
              <>
                <h5>No Classrooms created yet.</h5>
              </>
            }
            {
              classrooms.length >= 1 &&
              classrooms
              .sort((a, b) => a.name > b.name ? 1 : -1)
              .map((classroom, index) => {
                return (
                  <div key={index} className='text-center mb-1'>
                    <Link to={`/manage-classroom/${classroom.id}`} params={{ classroomid: classroom.id }}>
                      <Button className='w-100'>{classroom.name}</Button>
                    </Link>
                  </div>
                )
              })
            }
          </Card.Body>
        </Card>
      }
    </>
  )
}
