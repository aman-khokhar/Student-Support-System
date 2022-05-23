import React, { useRef, useState } from 'react';
import { Form, Button, Card, Alert, Overlay, Tooltip } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { createUserProfileDocument } from '../firebase';
import { useHistory } from 'react-router-dom';
import firebase from 'firebase/compat/app';

export default function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const [role, setRole] = useState('student');
  const nameRef = useRef();
  const semRef = useRef();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const { currentUser, signup } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    if(passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      if(role !== 'student') {
        const { user } = await signup(emailRef.current.value, passwordRef.current.value);
        await createUserProfileDocument(user, { 
          name: nameRef.current.value,
          role
        });
      } else {
        addUser(emailRef.current.value, passwordRef.current.value, nameRef.current.value, 'student', semRef.current.value);
      }
      
      setLoading(false);
      history.push('/');
    } catch(error) {
      setError(error);
      setLoading(false);
    }
  }

  async function addUser(email, password, name, role, sem) {
    try{
      setError('');
      const newApp = firebase.initializeApp({
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID
      }, 'Secondary');
      const { user } = await newApp.auth().createUserWithEmailAndPassword(email, password);
      const additionalData = {name, role, sem};
      const userRef = firebase.firestore().doc(`users/${user.uid}`)
      const snapShot = await userRef.get();
      if(!snapShot.exists) {
        const { name, role, email, sem } = user;
        try {
            await userRef.set({
                name,
                role,
                email,
                sem,
                ...additionalData,
            });
        } catch(error) {
            console.log('error creating user', error.message);
        }
      }
      await newApp.auth().signOut();
    } catch(error) {
      setError(error.message);
    }
  }

  return (
    <div>
      {currentUser.role === 'student' && history.push('/')}
      <Card className='w-50' style={{ margin: 'auto', padding: '10px' }}>
        <Card.Body>
          {error && <Alert variant='danger'>{error}</Alert>}
          {success && <Alert variant='success'>{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id='email'>
              <Form.Label>Email</Form.Label>
              <Form.Control type='email' placeholder='name@example.com' ref={emailRef} required />
            </Form.Group>
            <Form.Group id='password'>
              <Form.Label>Password</Form.Label>
              <Form.Control type='password' ref={passwordRef} required />
            </Form.Group>
            <Form.Group id='password-confirm'>
              <Form.Label>Password Confirmation</Form.Label>
              <Form.Control type='password' ref={passwordConfirmRef} required />
            </Form.Group>
            <Form.Group id='name'>
              <Form.Label>Name</Form.Label>
              <Form.Control type='text' ref={nameRef} required />
            </Form.Group>
            <Form.Group id='role'>
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="student">Student</option>
                <option value="lab-incharge">Lab Incharge</option>
                <option value="resource-manager">Resource Manager</option>
                <option value="hod">HOD</option>
              </Form.Select>
            </Form.Group>
            {
              role === 'student' &&
              <>
                <Form.Group>
                  <Form.Label>Select Semester</Form.Label>
                  <Form.Select
                    ref={semRef}
                    required >
                    <option value="1">SEM 1</option>
                    <option value="3">SEM 3</option>
                    <option value="5">SEM 5</option>
                    <option value="7">SEM 7</option>
                  </Form.Select>
                </Form.Group>
              </>
            }
            <Button disabled={loading} className='w-100 mt-4' type='submit'>
              Sign Up
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
