import React, { useState } from 'react';
import { Container, Nav, Navbar, NavDropdown, Row, Col, Modal, Button, Form, Alert } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import Logo from '../assets/DDU_logo.png';
import { useAuth } from '../contexts/AuthContext';
import { getAuth, updatePassword } from "firebase/auth";
import firebase from 'firebase/compat/app';

export default function Header() {
  const { currentUser, logout } = useAuth();
  const history = useHistory();

  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const reauthenticate = () => {
    let user = firebase.auth().currentUser;
    let cred = firebase.auth.EmailAuthProvider.credential(
      user.email, currentPassword);
    return user.reauthenticateWithCredential(cred);
  }

  function changePassword() {
    setError('');
    setSuccess('');
    const auth = getAuth();
    const user = auth.currentUser;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill out the fields first.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords does not match');
      return;
    }

    reauthenticate().then(() => {
      updatePassword(user, newPassword)
        .then(() => {
          setSuccess('Password updated successfully.');
        }).catch((error) => {
          setError(error);
        })
    }).catch((error) => {
      setError(error.message);
    })
  }

  function handleModalClose() {
    setError('');
    setSuccess('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShow(false);
  }

  return (
    <div style={{ paddingBottom: '160px' }}>
      <Navbar
        bg='dark'
        variant='dark'
        fixed='top'
        expand='lg' >
        <Container>
          <Navbar.Brand>
            <Row>
              <Col style={{ cursor: 'pointer' }} onClick={() => history.push('/')}>
                <img
                  alt=''
                  src={Logo}
                  width='75px'
                  height='61px' />
              </Col>
              <Col>
                <Row>
                  <Col><i>DHARMSINH DESAI UNIVERSITY</i></Col>
                </Row>
                <Row>
                  <Col>IT Department</Col>
                </Row>
              </Col>
            </Row>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav
              className="me-auto my-2 my-lg-0"
              style={{ maxHeight: '100px' }}
              navbarScroll >
              <Nav.Link as='span'>
                <Link to='/home' style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
              </Nav.Link>
              {
                currentUser &&
                <>
                  {
                    currentUser.role === 'student' &&
                    <>
                      <NavDropdown title='Issues'>
                        <NavDropdown.Item as='span'>
                          <Link to='/create-ticket' style={{ textDecoration: 'none', color: 'inherit' }}>
                            Report Issue
                          </Link>
                        </NavDropdown.Item>
                        <NavDropdown.Item as='span'>
                          <Link to='/tickets' style={{ textDecoration: 'none', color: 'inherit' }}>
                            View Issues
                          </Link>
                        </NavDropdown.Item>
                      </NavDropdown>
                    </>
                  }
                  {
                    currentUser.role === 'hod' &&
                    <>
                      <Nav.Link as='span'>
                        <Link to='/tickets/hod/lab' style={{ textDecoration: 'none', color: 'inherit' }}>Lab Issues</Link>
                      </Nav.Link>
                      <Nav.Link as='span'>
                        <Link to='/tickets/hod/classroom' style={{ textDecoration: 'none', color: 'inherit' }}>Classroom Issues</Link>
                      </Nav.Link>
                    </>

                  }
                  {
                    currentUser.role === 'lab-incharge' &&
                    <Nav.Link as='span'>
                      <Link to='/tickets/lab' style={{ textDecoration: 'none', color: 'inherit' }}>View Issues</Link>
                    </Nav.Link>
                  }
                  {
                    currentUser.role === 'resource-manager' &&
                    <>
                      <NavDropdown title='Lab'>
                        <NavDropdown.Item as='span'>
                          <Link to='/create-lab' style={{ textDecoration: 'none', color: 'inherit' }}>
                            Create Lab
                          </Link>
                        </NavDropdown.Item>
                        <NavDropdown.Item as='span'>
                          <Link to='/labs' style={{ textDecoration: 'none', color: 'inherit' }}>
                            Manage Lab
                          </Link>
                        </NavDropdown.Item>
                      </NavDropdown>
                      <NavDropdown title='Classroom'>
                        <NavDropdown.Item as='span'>
                          <Link to='/create-classroom' style={{ textDecoration: 'none', color: 'inherit' }}>
                            Create Classroom
                          </Link>
                        </NavDropdown.Item>
                        <NavDropdown.Item as='span'>
                          <Link to='/classrooms' style={{ textDecoration: 'none', color: 'inherit' }}>
                            Manage Classroom
                          </Link>
                        </NavDropdown.Item>
                      </NavDropdown>
                      <Nav.Link as='span'>
                        <Link to='/add-laptop' style={{ textDecoration: 'none', color: 'inherit' }}>Add Laptop</Link>
                      </Nav.Link>
                      <Nav.Link as='span'>
                        <Link to='/database' style={{ textDecoration: 'none', color: 'inherit' }}>Database Management</Link>
                      </Nav.Link>
                    </>
                  }
                </>
              }
              <Nav.Link as='span'>
                <Link to='/aboutus' style={{ textDecoration: 'none', color: 'inherit' }}>About Us</Link>
              </Nav.Link>
            </Nav>
            <Nav>
              {
                currentUser ?
                  <>
                    {
                      currentUser.role === 'resource-manager' &&
                      <NavDropdown title='Create User'>
                        <NavDropdown.Item as='span'>
                          <Link to='/create-user/single' style={{ textDecoration: 'none', color: 'inherit' }}>
                            Single User
                          </Link>
                        </NavDropdown.Item>
                        <NavDropdown.Item as='span'>
                          <Link to='/create-user/multiple' style={{ textDecoration: 'none', color: 'inherit' }}>
                            Multiple Users
                          </Link>
                        </NavDropdown.Item>
                      </NavDropdown>
                    }
                    <NavDropdown title='Account'>
                      {
                        currentUser.role !== 'student' &&
                        <NavDropdown.Item as='span'>
                          <span onClick={handleShow} style={{ cursor: 'pointer' }}>
                            Change Password
                          </span>
                        </NavDropdown.Item>
                      }
                      <NavDropdown.Item as='span'>
                        <span onClick={logout} style={{ cursor: 'pointer' }}>
                          Log out
                        </span>
                      </NavDropdown.Item>
                    </NavDropdown>
                  </> :
                  <Nav.Link as='span'>
                    <Link to='/login' style={{ textDecoration: 'none', color: 'inherit' }}>Log in</Link>
                  </Nav.Link>
              }
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Modal
        backdrop="static"
        keyboard={false}
        show={show}
        onHide={handleModalClose} >
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant='danger'>{error}</Alert>}
          {success && <Alert variant='success'>{success}</Alert>}
          <Form.Group>
            <Form.Label>Current Password</Form.Label>
            <Form.Control type='password' value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </Form.Group>
          <Form.Group>
            <Form.Label>New Password</Form.Label>
            <Form.Control type='password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={changePassword}>
            Update Password
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
