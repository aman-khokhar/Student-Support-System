import React, { useRef, useState } from 'react';
import { Form, Button, Card, Alert, Overlay, Tooltip } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import firebase from 'firebase/compat/app';
import * as XLSX from 'xlsx';
import Format from '../assets/correctFormat.jpg';

export default function CreateMultipleUsers() {
  const { currentUser } = useAuth();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const semRef = useRef();
  const [roleControl, setRoleControl] = useState('student');

  const [excelData, setExcelData] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const fileDialogRef = useRef();

  function handleExcelSubmit(event) {
    event.preventDefault();
     try {
      setError('');
      setSuccess('');
      setLoading(true);
      if(excelData.length > 1) {
        excelData.map((element, index) => {
          if((index > 0) && (index < (excelData.length-1))) {
            const email = element[0];
            const password = element[1];
            const name = element[2];
            if(roleControl === 'student') {
              addUser(email, password, name, 'student', semRef.current.value);
            } else if(roleControl === 'lab-incharge') {
              addIncharge(email, password, name, 'lab-incharge')
            }
          }
        })
      } else {
        setError('Please upload a file.');
        setShowTooltip(true);
      }
      if(!error) {
        setSuccess('Students Entry Created Successfully.');
      }
    } catch(error) {
      setError(error.message);
    } finally {
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

  async function addIncharge(email, password, name, role) {
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
      const additionalData = {name, role};
      const userRef = firebase.firestore().doc(`users/${user.uid}`)
      const snapShot = await userRef.get();
      if(!snapShot.exists) {
        const { name, role, email, sem } = user;
        try {
            await userRef.set({
                name,
                role,
                email,
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

  function doStuff(file) {
    if(file) {
      setError('');
      setShowTooltip(false);
      const reader = new FileReader();
      reader.onload = (e) => {
        const ab = e.target.result;
        const wb = XLSX.read(ab, {type:'array'});
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        if((ws['A1']['h'] === 'email') && (ws['B1']['h'] === 'password') && (ws['C1']['h'] === 'name')) {
          const data = XLSX.utils.sheet_to_json(ws, {header:1});
          setExcelData(data);
        } else {
          setError('Please upload excel file with correct format. A1->email, B1->password, C1->name');
          setShowTooltip(true);
          setExcelData([]);
        }
        
      };
      reader.readAsArrayBuffer(file);
    }
  }

  return (
    <div>
      {currentUser.role === 'student' && history.push('/')}
      <Card className='w-50' style={{ margin: 'auto', padding: '10px' }}>
        <Card.Body>
          {error && <Alert variant='danger'>{error}</Alert>}
          {success && <Alert variant='success'>{success}</Alert>}
          <Form onSubmit={handleExcelSubmit}>
            <Form.Group>
              <Form.Label>Select Role</Form.Label>
              <Form.Select
                value={roleControl}
                onChange={(e) => setRoleControl(e.target.value)}
                required
              >
                <option value="student">Student</option>
                <option value="lab-incharge">Lab Incharge</option>
              </Form.Select>
            </Form.Group>
            {
              roleControl === 'student' &&
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
            } 
            <Form.Group>
              <Form.Label>Select Excel file(.xlsx)</Form.Label>
              <Form.Control 
                type="file" 
                ref={fileDialogRef}
                onChange={(e) => doStuff(e.target.files[0])}
                accept='.xlsx'
                required />
              <Overlay target={fileDialogRef} show={showTooltip} placement="right">
                {(props) => (
                  <Tooltip id="overlay-example" {...props}>
                    Error Check Above
                  </Tooltip>
                )}
              </Overlay>
            </Form.Group>
            <Form.Group>
              <Form.Label>Correct Format</Form.Label>
              <Card.Img variant="top" src={Format} style={{ border: '1px solid' }} />
            </Form.Group>
            <Button disabled={loading} className='w-100 mt-4' type='submit'>
              Create Users
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
