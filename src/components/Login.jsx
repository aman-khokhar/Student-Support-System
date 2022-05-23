import React, { useRef, useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';

export default function Login({ history: { push }}) {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      login(emailRef.current.value, passwordRef.current.value)
      .then(() => {
        setLoading(false);
        push('/');
      }).catch((error) => {
        setError(error);
        setLoading(false);
      })
    } catch(error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div>
      <Card className='w-50' style={{ margin: 'auto', padding: '10px' }}>
        <Card.Body>
          <h2 className='text-center mb-4'>Log In</h2>
          {error && <Alert variant='danger'>{error.message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id='email'>
              <Form.Label>Email</Form.Label>
              <Form.Control type='email' ref={emailRef} placeholder='name@example.com' required />
            </Form.Group>
            <Form.Group id='password'>
              <Form.Label>Password</Form.Label>
              <Form.Control type='password' ref={passwordRef} required />
            </Form.Group>
            <Button disabled={loading} className='w-100 mt-4' type='submit'>
              Log In
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
