import React from 'react';
import { Container, Nav, Navbar, NavDropdown, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Footer() {

  return (
    <div style={{ paddingTop: '60px' }}>
      <Navbar
      fixed='bottom'
        bg='dark' 
        variant='dark' >
        <Container>
          <Nav>
            <Nav.Link as='span'>
              <Link to='/contactus' style={{ textDecoration: 'none', color: 'inherit' }}>Contact Us</Link>
            </Nav.Link>
          </Nav>
          <span style={{ color: 'white'}}>© DHARMSINH DESAI UNIVERSITY</span>
        </Container>
      </Navbar>
    </div>
  )
}
