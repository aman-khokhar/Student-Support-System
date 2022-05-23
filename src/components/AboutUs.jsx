import React from 'react'
import { Card, Container, Row, Col } from 'react-bootstrap'
import Aman from '../assets/amankhokhar.jpg';
import ADDSir from '../assets/addSir.jpg';
import Raj from '../assets/rajnariya.jpg';
import { FaLinkedin, FaGithub, FaEnvelope, FaInstagram } from 'react-icons/fa';

export default function AboutUs() {
  return (
    <div>
      <h2 className='text-center mb-4'>About Us</h2>
      <h2 className='mx-3'>Developers</h2>
      <Container fluid className='mb-4'>
        <Card>
          <Row>
            <Col xs='2'>
              <Card.Img className='w-100' variant='left' src={Aman} />
            </Col>
            <Col xs='9'>
              <Card.Body>
                <Card.Title><h2>Aman Khokhar</h2></Card.Title><hr />
                <Card.Text>
                  Hello I am Aman Khokhar Student of DDU IT Department. We developed this website as SEM 8 Industrial Project. Objective of this website is to help students who have problems with their PC in their Lab or problems with Benches, etc in classrooms report to Authority or Faculties with ease.
                </Card.Text>
                <Card.Title><h5>Some Links about me</h5></Card.Title><hr />
                <Row>
                  <Col><FaLinkedin />&nbsp;
                    <a 
                      style={{ textDecoration: 'none', color: 'black' }} 
                      target='_blank' 
                      href='https://www.linkedin.com/in/aman-khokhar-0150a2214/'>
                      Linkedin
                    </a>
                  </Col>
                  <Col><FaGithub />&nbsp;
                    <a 
                      style={{ textDecoration: 'none', color: 'black' }} 
                      target='_blank' 
                      href='https://github.com/aman-khokhar'>
                      Github
                    </a>
                  </Col>
                  <Col><FaEnvelope />&nbsp;
                    khokharaman786@gmail.com
                  </Col>
                </Row>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </Container>
      <Container fluid className='mb-4'>
        <Card>
          <Row>
            <Col xs='2'>
              <Card.Img className='w-100' variant='left' src={Raj} />
            </Col>
            <Col xs='9'>
              <Card.Body>
                <Card.Title><h2>Raj Nariya</h2></Card.Title><hr />
                <Card.Text>
                  Hello I am Raj Nariya Student of DDU IT Department. We developed this website as SEM 8 Industrial Project. Objective of this website is to help students who have problems with their PC in their Lab or problems with Benches, etc in classrooms report to Authority or Faculties with ease.
                </Card.Text>
                <Card.Title><h5>Some Links about me</h5></Card.Title><hr />
                <Row>
                  <Col><FaInstagram />&nbsp;
                    @rajnariya8980
                  </Col>
                  <Col><FaGithub />&nbsp;
                    <a 
                      style={{ textDecoration: 'none', color: 'black' }} 
                      target='_blank' 
                      href='https://github.com/Rajnariya'>
                      Github
                    </a>
                  </Col>
                  <Col><FaEnvelope />&nbsp;
                    rajnariya8980@gmail.com
                  </Col>
                </Row>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </Container><br /><hr />
      <h2 className='mx-3'>Mentor</h2>
      <Container fluid className='mb-4'>
        <Card>
          <Row>
            <Col xs='2'>
              <Card.Img className='w-100' variant='left' src={ADDSir} />
            </Col>
            <Col xs='9'>
              <Card.Body>
                <Card.Title><h2>Prof. Anandkumar D. Dave</h2></Card.Title><hr />
                <Card.Text>
                  <strong>Experience:</strong> 12 Years<br />
                  <strong>AICTE Faculty ID:</strong> 1-4765527446<br />
                </Card.Text>
                <FaEnvelope />&nbsp;anand.it@ddu.ac.in
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </Container>
    </div>
  )
}
