import { Button, Card } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useHistory, Link } from 'react-router-dom';
import { firestore } from '../firebase';
import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Labs() {
  const { currentUser } = useAuth();
  const role = currentUser.role;
  const history = useHistory();
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, 'labs'),(snapshot) => {
      setLabs(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
    });
    return unsub;
  }, []);

  return (
    <>
      {(role === 'student' || role === 'lab-incharge' || role === 'hod') && history.push('/')}
      {
        role === 'resource-manager' && 
        <Card className='w-50' style={{ margin: 'auto', padding: '10px' }}>
        <Card.Body>
          {
            (role === 'resource-manager' && labs.length < 1) && 
            <>
              <h5>No Labs created yet.</h5>
            </>
          }
          {
            (role === 'resource-manager' && labs.length >= 1) && 
            labs
            .sort((a, b) => a.name > b.name ? 1 : -1)
            .map((lab, index) => {
              return (
                <div key={index} className='text-center mb-1'>
                  <Link to={`/manage-lab/${lab.id}`} params={{ labid: lab.id }}>
                    <Button className='w-100'>{lab.name}</Button>
                  </Link>
                </div>
              )
            })
          }
        </Card.Body>
      </Card>
      }
    </>
  );
}
