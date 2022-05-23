import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Container, NavItem } from 'react-bootstrap'
import LabImg from '../assets/lab.jpg';
import ClassroomImg from '../assets/classroom.jpg';
import ComputerImg from '../assets/computer.jpg';
import { collection, onSnapshot } from 'firebase/firestore';
import { firestore } from '../firebase';

export default function Department() {
  const [labs, setLabs] = useState(1);
  const [classrooms, setClassrooms] = useState(1);
  const [pcs, setPcs] = useState(1);

  useEffect(() => {
    const unsublab = onSnapshot(collection(firestore, 'labs'), (snapshot) => {
      setLabs(snapshot.docs.length);
    });
    const unsubClassroom = onSnapshot(collection(firestore, 'classrooms'), (snapshot) => {
      setClassrooms(snapshot.docs.length);
    });
    const unsubPc = onSnapshot(collection(firestore, 'labs'), (snapshot) => {
      let pcCount = 0;
      snapshot.docs.map(doc => {
        let item = doc.data();
        pcCount += item.pcs.length;
      })
      setPcs(pcCount);
    });
    return (unsublab, unsubClassroom, unsubPc)
  }, []);


  return (
    <div>
      <Container fluid>
      </Container><br />
      <Container fluid>
        <Card className='w-100'>
          <Row>
            <Col xs='4'>
              <Card.Img className='w-100'variant='left' src={LabImg} />
            </Col>
            <Col xs='8'>
              <Card.Body>
                <h2>Lab</h2><hr />
                A computer lab is a space which provides computer services to a defined community. Computer labs are typically provided by libraries to the public, by academic institutions to students who attend the institution, or by other institutions to the public or to people affiliated with that institution. Users typically must follow a certain user policy to retain access to the computers. This generally consists of the user not engaging in illegal activities or attempting to circumvent any security or content-control software while using the computers. In public settings, computer lab users are often subject to time limits, in order to allow more people a chance to use the lab, whereas in other institutions, computer access typically requires valid personal login credentials, which may also allow the institution to track the user's activities.<br />
                Number of Computer Labs in IT department is {labs}
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </Container><br />
      <Container fluid>
        <Card className='w-100'>
          <Row>
            <Col xs='8'>
              <Card.Body>
                <h2>Classroom</h2><hr />
                A classroom or schoolroom is a learning space in which both children and adults learn. Classrooms are found in educational institutions of all kinds, ranging from preschools to universities, and may also be found in other places where education or training is provided, such as corporations and religious and humanitarian organizations. The classroom provides a space where learning can take place uninterrupted by outside distractions.<br />
                Number of Classrooms in IT department is {classrooms}
              </Card.Body>
            </Col>
            <Col xs='4'>
              <Card.Img className='w-100'variant='right' src={ClassroomImg} />
            </Col>
          </Row>
        </Card>
      </Container><br />
      <Container fluid>
        <Card className='w-100'>
          <Row>
            <Col xs='4'>
              <Card.Img className='w-100'variant='left' src={ComputerImg} />
            </Col>
            <Col xs='8'>
              <Card.Body>
                <h2>Computers</h2><hr />
                A computer is a digital electronic machine that can be programmed to carry out sequences of arithmetic or logical operations (computation) automatically. Modern computers can perform generic sets of operations known as programs. These programs enable computers to perform a wide range of tasks. A computer system is a "complete" computer that includes the hardware, operating system (main software), and peripheral equipment needed and used for "full" operation. This term may also refer to a group of computers that are linked and function together, such as a computer network or computer cluster.<br />
                Number of Computers in IT department is {pcs}
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </Container><br />
    </div>
  )
}
