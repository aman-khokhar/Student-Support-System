import React from 'react'
import { Card, Container, Row, Col, Image } from 'react-bootstrap'
import Aman from '../assets/amankhokhar_sm.jpg';
import Raj from '../assets/rajnariya_sm.jpg';
import ADDSir from '../assets/addSir.jpg';
import VKDSir from '../assets/VKDSir.jpg';

export default function ContactUs() {
  return (
    <div>
      <h2 className='text-center mb-4'>Contact Us</h2>
      <Container className='mb-4'>
        <Row className='mb-4'>
          <Col>
            <Card>
              <Row>
                <Col xs='5'>
                  <Image thumbnail src={VKDSir} />
                </Col>
                <Col>
                  <Card.Body>
                    <Card.Title><h3>Dr. Vipul K. Dabhi</h3></Card.Title>
                    <Card.Title>Professor & Head</Card.Title><br />
                    <Card.Text>
                      <strong>Mobile:{' '}</strong>9427384573
                    </Card.Text>
                    <strong>E-Mail:{' '}</strong>
                    <a 
                      target='_blank' 
                      href='mailto:vipuldabhi.it@ddu.ac.in'>
                      vipuldabhi.it@ddu.ac.in
                    </a>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col>
            <Card>
              <Row>
                <Col xs='4'>
                  <Image thumbnail src={ADDSir} />
                </Col>
                <Col>
                  <Card.Body>
                    <Card.Title><h3>Prof. Anandkumar D. Dave</h3></Card.Title>
                    <Card.Title>Professor</Card.Title><br />
                    <Card.Text>
                      <strong>Mobile:{' '}</strong>9428592929
                    </Card.Text>
                    <strong>E-Mail:{' '}</strong>
                    <a 
                      target='_blank' 
                      href='mailto:anand.it@ddu.ac.in'>
                      anand.it@ddu.ac.in
                    </a>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        <Row className='mb-4'>
          <Col>
            <Card>
              <Row>
                <Col xs='4'>
                  <Image thumbnail rounded src={Aman} />
                </Col>
                <Col>
                  <Card.Body>
                    <Card.Title><h3>Aman Khokhar</h3></Card.Title>
                    <Card.Title>Student, Batch 2018</Card.Title><br />
                    <Card.Text>
                      <strong>Mobile:{' '}</strong>9898853973
                    </Card.Text>
                    <strong>E-Mail:{' '}</strong>
                    <a 
                      target='_blank' 
                      href='mailto:khokharaman786@gmail.com'>
                      khokharaman786@gmail.com
                    </a>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col>
            <Card>
              <Row>
                <Col xs='5'>
                  <Image thumbnail src={Raj} />
                </Col>
                <Col>
                  <Card.Body>
                    <Card.Title><h3>Raj Nariya</h3></Card.Title>
                    <Card.Title>Student, Batch 2018</Card.Title><br />
                    <Card.Text>
                      <strong>Mobile:{' '}</strong>8980662904
                    </Card.Text>
                    <strong>E-Mail:{' '}</strong>
                    <a 
                      target='_blank' 
                      href='mailto:rajnariya8980@gmail.com'>
                      rajnariya8980@gmail.com
                    </a>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
