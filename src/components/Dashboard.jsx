import { collection, onSnapshot } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { Accordion, Container, Form, Row, Col, Spinner, Card, Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { firestore } from "../firebase";
import CardTicket from "./CardTicket";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [loadingPage, setLoadingPage] = useState(true);

  const [tickets, setTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState('');
  const [ticketFilterR, setTicketFilterR] = useState('');

  const [labs, setLabs] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [laptops, setLaptops] = useState([]);

  const [ticketsAll, setTicketsAll] = useState([]);
  const [filterP, setFilterP] = useState('');
  const [filterU, setFilterU] = useState('');
  const [filterR, setFilterR] = useState('');
  const [labTicketData, setLabTicketData] = useState([]);
  const [classTicketData, setClassTicketData] = useState([]);
  const [labPcData, setLabPcData] = useState({});
  const [criticalPcData, setCriticalPcData] = useState({});

  const [lab, setLab] = useState({});
  const [ticketLab, setTicketLab] = useState([]);
  const [ticketData, setTicketData] = useState([]);
  const [pcData, setPcData] = useState([]);

  useEffect(() => {
    if(currentUser.role !== 'student') return;

    const unsubTicket = onSnapshot(collection(firestore, 'tickets'), (snapshot) => {
      let ticketArray = [];
      snapshot.docs.map(doc => {
        let item = doc.data();
        if(item.uid === currentUser.uid) {
          ticketArray.push({...item, id: doc.id});
        }
      });
      setTickets(ticketArray);
      setLoadingPage(false);
    });

    return (unsubTicket);
  }, []);

  useEffect(() => {
    if(currentUser.role !== 'resource-manager') return;

    const unsubLab = onSnapshot(collection(firestore, 'labs'),(snapshot) => {
      setLabs(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
    });

    const unsubClassroom = onSnapshot(collection(firestore, 'classrooms'),(snapshot) => {
      setClassrooms(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
      setLoadingPage(false);
    });

    return (unsubLab, unsubClassroom);
  }, []);

  useEffect(() => {
    if(currentUser.role !== 'resource-manager') return;

    let laptopArray = [];
    labs.map((lab, index) => {
      if(lab.laptops) {
        lab.laptops.map((laptop, index) => {
          laptopArray.push({...laptop, labid: lab.id, labName: lab.name});
        })
      }
    })
    setLaptops(laptopArray);
  }, [loadingPage]);

  useEffect(() => {
    if(currentUser.role !== 'hod') return;

    const unsubLab = onSnapshot(collection(firestore, 'labs'),(snapshot) => {
      setLabs(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
    });

    const unsubClassroom = onSnapshot(collection(firestore, 'classrooms'),(snapshot) => {
      setClassrooms(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
    });

    const unsubTicketsAll = onSnapshot(collection(firestore, 'tickets'),(snapshot) => {
      setTicketsAll(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
      setLoadingPage(false);
    });

    return(unsubTicketsAll, unsubLab, unsubClassroom);
  }, []);

  useEffect(() => {
    if(currentUser.role !== 'hod') return;

    let acTicketCount = 0;
    let pcTicketCount = 0;
    let fanTicketCount = 0;
    let lightTicketCount = 0;
    let printerTicketCount = 0;
    let switchBoardTicketCount = 0;
    let projectorTicketCount = 0;
    let tableTicketCount = 0;

    let labArray = [];

    labs.map(lab => {
      acTicketCount = 0;
      pcTicketCount = 0;
      fanTicketCount = 0;
      lightTicketCount = 0;
      printerTicketCount = 0;
      switchBoardTicketCount = 0;
      projectorTicketCount = 0;
      tableTicketCount = 0;
      ticketsAll.map(ticket => {
        if(ticket.labName === lab.name){
          if(ticket.problemWith === 'ac') {acTicketCount += 1;}
          else if(ticket.problemWith === 'pc') {pcTicketCount += 1;}
          else if(ticket.problemWith === 'fan') {fanTicketCount += 1;}
          else if(ticket.problemWith === 'light') {lightTicketCount += 1;}
          else if(ticket.problemWith === 'printer') {printerTicketCount += 1;}
          else if(ticket.problemWith === 'projector') {projectorTicketCount += 1;}
          else if(ticket.problemWith === 'tableChair') {tableTicketCount += 1;}
          else if(ticket.problemWith === 'switchBoard') {switchBoardTicketCount += 1;}
        }
      })
      labArray.push({
        name: lab.name,
        acTicketCount,
        pcTicketCount,
        fanTicketCount,
        lightTicketCount,
        printerTicketCount,
        switchBoardTicketCount,
        projectorTicketCount,
        tableTicketCount,
      })
    })

    let boardTicketCount = 0;
    let benchTicketCount = 0;

    let classArray = [];

    classrooms.map(classroom => {
      acTicketCount = 0;
      pcTicketCount = 0;
      boardTicketCount = 0;
      projectorTicketCount = 0;
      benchTicketCount = 0;
      ticketsAll.map(ticket => {
        if(ticket.className === classroom.name){
          if(ticket.problemWith === 'ac') {acTicketCount += 1;}
          else if(ticket.problemWith === 'pc') {pcTicketCount += 1;}
          else if(ticket.problemWith === 'board') {boardTicketCount += 1;}
          else if(ticket.problemWith === 'projector') {projectorTicketCount += 1;}
          else if(ticket.problemWith === 'bench') {benchTicketCount += 1;}
        }
      })
      classArray.push({
        name: classroom.name,
        acTicketCount,
        pcTicketCount,
        boardTicketCount,
        projectorTicketCount,
        benchTicketCount,
      })
    })

    let labObject = {};
    let pcObject = {};

    labs.map(lab => {
      pcObject = {};
      ticketsAll.map(ticket => {
        if(lab.name === ticket.labName) {
          if(ticket.problemWith === 'pc') {
            let key = 'PC ' + ticket.pcNumber;
            pcObject = {
              ...pcObject,
              [key]: []
            }
          }
        }
      })
      labObject = {
        ...labObject,
        [lab.name]: pcObject,
      }
    })

    labs.map(lab => {
      ticketsAll.map(ticket => {
        if(lab.name === ticket.labName) {
          if(ticket.problemWith === 'pc') {
            let key = 'PC ' + ticket.pcNumber;
            labObject[lab.name][key].push({id: ticket.id, problem: ticket.problem, status: ticket.status});
          }
        }
      })
    })
    
    let criticalLab = {};
    let criticalPc = {};
    Object.keys(labObject).map(key => {
      criticalPc = {};
      let highestProblems = -1;
      Object.keys(labObject[key]).map(PcName => {
        let currentLength = labObject[key][PcName].length;
        if(highestProblems === -1) {
          highestProblems = currentLength;
          criticalPc = {[PcName]: labObject[key][PcName]};
        }
        if(currentLength > highestProblems) {
          highestProblems = currentLength;
          criticalPc = {[PcName]: labObject[key][PcName]};
        }
      });
      criticalLab = {
        ...criticalLab,
        [key]: criticalPc,
      }
    });

    setLabTicketData(labArray);
    setClassTicketData(classArray);
    setLabPcData(labObject);
    setCriticalPcData(criticalLab);

  }, [loadingPage]);

  useEffect(() => {
    if(currentUser.role !== 'lab-incharge') return;
    
    const unsubLab = onSnapshot(collection(firestore, 'labs'), snapshot => {
      snapshot.docs.map(doc => {
        if(doc.id === currentUser.labId) {
          setLab(doc.data());
        }
      });
    });
    const unsubTicket = onSnapshot(collection(firestore, 'tickets'), (snapshot) => {
      setTicketLab(snapshot.docs.map(doc => ({...doc.data(), id: doc.id}))
      .filter(doc => (doc.labId===currentUser.labId && !doc.classId)));
      setLoadingPage(false);
    });

    return (unsubLab, unsubTicket);
  }, []);

  useEffect(() => {
    if(currentUser.role !== 'lab-incharge') return;

    let acTicketCount = 0;
    let pcTicketCount = 0;
    let fanTicketCount = 0;
    let lightTicketCount = 0;
    let printerTicketCount = 0;
    let switchBoardTicketCount = 0;
    let projectorTicketCount = 0;
    let tableTicketCount = 0;

    let ticketObj = {};

    ticketLab.map(ticket => {
      if(ticket.problemWith === 'ac') {acTicketCount += 1;}
      else if(ticket.problemWith === 'pc') {pcTicketCount += 1;}
      else if(ticket.problemWith === 'fan') {fanTicketCount += 1;}
      else if(ticket.problemWith === 'light') {lightTicketCount += 1;}
      else if(ticket.problemWith === 'printer') {printerTicketCount += 1;}
      else if(ticket.problemWith === 'projector') {projectorTicketCount += 1;}
      else if(ticket.problemWith === 'tableChair') {tableTicketCount += 1;}
      else if(ticket.problemWith === 'switchBoard') {switchBoardTicketCount += 1;}
    })
    ticketObj = {
      acTicketCount,
      pcTicketCount,
      fanTicketCount,
      lightTicketCount,
      printerTicketCount,
      switchBoardTicketCount,
      projectorTicketCount,
      tableTicketCount,
    };

    let pcObject = {};

    ticketLab.map(ticket => {
      if(ticket.problemWith === 'pc') {
        let key = 'PC ' + ticket.pcNumber;
        pcObject = {
          ...pcObject,
          [key]: []
        }
      }
    })

    ticketLab.map(ticket => {
      if(ticket.problemWith === 'pc') {
        let key = 'PC ' + ticket.pcNumber;
        pcObject[key].push({id: ticket.id, problem: ticket.problem, status: ticket.status});
      }
    })

    setTicketData(ticketObj);
    setPcData(pcObject);

  }, [loadingPage]);

  return (
    <div>
      {
        loadingPage &&
        <>
          <div className='text-center'>
            <Spinner animation='border' /><big><strong><p> Loading</p></strong></big>
          </div>
        </>
      }
      {
        !loadingPage &&
        <>
          <Container fluid className='mb-4'>
            <h4>Welcome, {currentUser.name}</h4>
          </Container>
          {
            currentUser.role === 'student' &&
            <>
            <Container fluid className='mb-4'>
              <Accordion defaultActiveKey='0'>
                <Accordion.Item eventKey='0'>
                  <Accordion.Header>Issue tickets by you</Accordion.Header>
                  <Accordion.Body>
                    {
                      tickets.length > 0 ?
                      <>
                      <Form.Control
                        type='input'
                        value={ticketFilter}
                        onChange={(e) => setTicketFilter(e.target.value)}
                        className='mb-4'
                        placeholder='Type to filter parameters' />
                      {
                        tickets
                        .filter(ticket => ticket.status !== 'resolved')
                        .filter(ticket => (
                          ticket.problemWith.includes(ticketFilter) ||
                          ticket.problem.includes(ticketFilter) ||
                          ticket.pcNumber === parseInt(ticketFilter)
                        ))
                        .sort((a, b) => {
                          let nonDateA = a.createdAt;
                          let nonDateB = b.createdAt;
                          nonDateA = nonDateA.replaceAll(',','');
                          nonDateA = nonDateA.replace(' at ',' ');
                          nonDateB = nonDateB.replaceAll(',','');
                          nonDateB = nonDateB.replace(' at ',' ');
                          let DateA = new Date(nonDateA);
                          let DateB = new Date(nonDateB);
                          return DateB - DateA;
                        })
                        .map((ticket, index) => {
                          return(
                            <Link 
                              key={index} 
                              style={{
                                textDecoration: 'none',
                                color: 'black',
                              }} 
                              to={`/ticket/${ticket.id}`}
                              params={{ ticketid: ticket.id }}>
                              <CardTicket ticket={ticket} />
                            </Link>
                          )
                        })
                      }
                      </> :
                      <>
                        <h5>No issue tickets have been created by you.</h5>
                      </>
                    }
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Container>
            <Container fluid className='mb-4'>
              <Accordion>
                <Accordion.Item eventKey='0'>
                  <Accordion.Header>Resolved Issues</Accordion.Header>
                  <Accordion.Body>
                    {
                      tickets
                      .filter(ticket => ticket.status === 'resolved')
                      .length === 0 &&
                      <>
                        <h5>Either no issue tickets have been created by you or no issue tickets have been resolved yet.</h5>
                      </>
                    }
                    {
                      tickets
                      .filter(ticket => ticket.status === 'resolved')
                      .length > 0 &&
                      <>
                      <Form.Control
                        type='input'
                        value={ticketFilterR}
                        onChange={(e) => setTicketFilterR(e.target.value)}
                        className='mb-4'
                        placeholder='Type to filter parameters' />
                      {
                        tickets
                        .filter(ticket => ticket.status === 'resolved')
                        .filter(ticket => (
                          ticket.problemWith.includes(ticketFilterR) ||
                          ticket.problem.includes(ticketFilterR) ||
                          ticket.pcNumber === parseInt(ticketFilterR)
                        ))
                        .sort((a, b) => {
                          let nonDateA = a.createdAt;
                          let nonDateB = b.createdAt;
                          nonDateA = nonDateA.replaceAll(',','');
                          nonDateA = nonDateA.replace(' at ',' ');
                          nonDateB = nonDateB.replaceAll(',','');
                          nonDateB = nonDateB.replace(' at ',' ');
                          let DateA = new Date(nonDateA);
                          let DateB = new Date(nonDateB);
                          return DateB - DateA;
                        })
                        .map((ticket, index) => {
                          return(
                            <Link 
                              key={index} 
                              style={{
                                textDecoration: 'none',
                                color: 'black',
                              }} 
                              to={`/ticket/${ticket.id}`}
                              params={{ ticketid: ticket.id }}>
                              <CardTicket ticket={ticket} />
                            </Link>
                          )
                        })
                      }
                      </>
                    }
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Container>
            </>
          }
          {
            currentUser.role === 'resource-manager' &&
            <>
              <Container fluid className='mb-4'>
                <Row>
                  <Col>
                    <Card border='dark'>
                      <Card.Body>
                        <Card.Title>Labs</Card.Title><hr />
                        <Card.Text>
                          Total Labs: {labs.length}
                        </Card.Text>
                        {
                          labs.length > 0 &&
                          labs
                          .sort((a, b) => a.name > b.name ? 1 : -1)
                          .map((lab, index) => {
                            return(
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
                  </Col>
                  <Col>
                    <Card border='dark'>
                      <Card.Body>
                        <Card.Title>Classrooms</Card.Title><hr />
                        <Card.Text>
                          Total Classrooms: {classrooms.length}
                        </Card.Text>
                        {
                          classrooms.length > 0 &&
                          classrooms
                          .sort((a, b) => a.name > b.name ? 1 : -1)
                          .map((classroom, index) => {
                            return(
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
                  </Col>
                </Row>
              </Container>
              <Container fluid className='mb-4'>
                <Card className='w-50' border='dark'>
                  <Card.Body>
                    <Card.Title>Laptops</Card.Title><hr />
                    {
                      laptops.length > 0 &&
                      laptops
                      .sort((a, b) => a.labName > b.labName ? 1 : -1)
                      .map((laptop, index) => {
                        return(
                          <div key={index} className='mb-2'>
                            <span>Laptop {index+1} : </span>{'    '}
                            <Link to={`/manage-lab/${laptop.labid}`} params={{ labid: laptop.labid }}>
                              <Button className='w-50'>{laptop.labName}</Button>
                            </Link>
                          </div>
                        )
                      })
                    }
                  </Card.Body>
                </Card>
              </Container>
              <Container fluid className='mb-4'>
                <Accordion>
                  <Accordion.Item eventKey='0'>
                    <Accordion.Header>Labs</Accordion.Header>
                    <Accordion.Body>
                      {
                        labs.length > 0 &&
                        <>
                          {
                            labs
                            .sort((a, b) => a.name > b.name ? 1 : -1)
                            .map((lab, index) => {
                              return(
                                <Card key={index} className='mb-4' border='dark'>
                                  <Card.Body>
                                    <Card.Title>{lab.name}</Card.Title><hr />
                                    <Card.Text>
                                      <b>Number of AC:</b> {lab.noAc}<br />
                                      <b>Number of PC:</b> {lab.noPcs}<br />
                                      <b>Number of Fan:</b> {lab.noFan}<br />
                                      <b>Number of Light:</b> {lab.noLight}<br />
                                      <b>Number of Cupboard:</b> {lab.noCupboard}<br />
                                      <b>Number of Table & Chairs:</b> {lab.noTableChair}
                                    </Card.Text>
                                  </Card.Body>
                                </Card>
                              )
                            })
                          }
                        </>
                      }
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Container>
              <Container fluid className='mb-4'>
                <Accordion>
                  <Accordion.Item eventKey='0'>
                    <Accordion.Header>Classrooms</Accordion.Header>
                    <Accordion.Body>
                      {
                        classrooms.length > 0 &&
                        <>
                          {
                            classrooms
                            .sort((a, b) => a.name > b.name ? 1 : -1)
                            .map((classroom, index) => {
                              return(
                                <Card key={index} className='mb-4' border='dark'>
                                  <Card.Body>
                                    <Card.Title>{classroom.name}</Card.Title><hr />
                                    <Card.Text>
                                      <b>Number of AC:</b> {classroom.noAc}<br />
                                      <b>Number of Tables:</b> {classroom.tables}<br />
                                      <b>Number of Bench</b> {classroom.benches}
                                    </Card.Text>
                                  </Card.Body>
                                </Card>
                              )
                            })
                          }
                        </>
                      }
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Container>
            </>
          }
          {
            currentUser.role === 'hod' &&
            <>
              <Container fluid className='mb-4'>
                <h5 style={{ paddingLeft: '10px' }}>Issue tickets data of All time</h5><hr />
                <Row className='mt-2'>
                {
                  labs
                  .sort((a, b) => a.name > b.name ? 1 : -1)
                  .map((lab, index) => {
                    return(
                      <Col xs={4} className='mb-2' key={index}>
                        <Card border='dark'>
                          <Card.Body>
                            <Card.Title>{lab.name}</Card.Title><hr />
                            {
                              labTicketData.map((ticketLab, index) => {
                                if(ticketLab.name === lab.name) {
                                  return(
                                    <Card.Text key={index}>
                                      <b>Total tickets of AC:</b> {ticketLab.acTicketCount}<br />
                                      <b>Total tickets of PC:</b> {ticketLab.pcTicketCount}<br />
                                      <b>Total tickets of Fan:</b> {ticketLab.fanTicketCount}<br />
                                      <b>Total tickets of Light:</b> {ticketLab.lightTicketCount}<br />
                                      <b>Total tickets of Projector:</b> {ticketLab.projectorTicketCount}<br />
                                      <b>Total tickets of Printer:</b> {ticketLab.printerTicketCount}<br />
                                      <b>Total ticketsof Switch Board:</b> {ticketLab.switchBoardTicketCount}<br />
                                      <b>Total tickets of Table & Chairs:</b> {ticketLab.tableTicketCount}
                                    </Card.Text>
                                  )
                                }
                              })
                            }
                          </Card.Body>
                        </Card>
                      </Col>
                    )
                  })
                }
                </Row>
                <Row className='mt-2'>
                {
                  classrooms
                  .sort((a, b) => a.name > b.name ? 1 : -1)
                  .map((classroom, index) => {
                    return(
                      <Col xs={4} className='mb-2' key={index}>
                        <Card border='dark'>
                          <Card.Body>
                            <Card.Title>{classroom.name}</Card.Title><hr />
                            {
                              classTicketData.map((ticketClass, index) => {
                                if(ticketClass.name === classroom.name) {
                                  return(
                                    <Card.Text key={index}>
                                      <b>Total tickets of AC:</b> {ticketClass.acTicketCount}<br />
                                      <b>Total tickets of PC:</b> {ticketClass.pcTicketCount}<br />
                                      <b>Total tickets of Projector:</b> {ticketClass.projectorTicketCount}<br />
                                      <b>Total tickets of Board:</b> {ticketClass.boardTicketCount}<br />
                                      <b>Total tickets of Bench:</b> {ticketClass.benchTicketCount}
                                    </Card.Text>
                                  )
                                }
                              })
                            }
                          </Card.Body>
                        </Card>
                      </Col>
                    )
                  })
                }
                </Row>
              </Container>
              <Container fluid className='mb-4'>
                <h5 style={{ paddingLeft: '10px' }}>PC issues of All time</h5><hr />
                <Row className='mt-2'>
                  {
                    Object.keys(labPcData).map((key,index) => {
                      return(
                        <Col xs={4} className='mb-2' key={index}>
                          <Card border='dark'>
                            <Card.Body>
                              <Card.Title>{key}</Card.Title>
                              <Accordion key={index}>
                              {
                                Object.keys(labPcData[key]).map((pc, index) => {
                                  return(
                                      <Accordion.Item key={index} eventKey={index}>
                                        <Accordion.Header>{pc}</Accordion.Header>
                                        <Accordion.Body>
                                          <Table>
                                            <thead>
                                              <tr>
                                                <th>#</th>
                                                <th>Problem</th>
                                                <th>Status</th>
                                                <th>Link</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                            {
                                              labPcData[key][pc].map((data, index) => {
                                                return(
                                                  <tr key={index}>
                                                    <td>{index+1}</td>
                                                    <td>{data.problem}</td>
                                                    <td>{data.status}</td>
                                                    <td>
                                                      <Link 
                                                        to={`/ticket/${data.id}`}
                                                        params={{ ticketid: data.id }}>
                                                          View
                                                      </Link>
                                                    </td>
                                                  </tr>
                                                )
                                              })
                                            }
                                            </tbody>
                                          </Table>
                                        </Accordion.Body>
                                      </Accordion.Item>
                                  )
                                })
                              }
                              </Accordion>
                            </Card.Body>
                          </Card>
                        </Col>
                      )
                    })
                  }
                </Row>
              </Container>
              <Container fluid className='mb-4'>
                <h5 style={{ paddingLeft: '10px' }}>Critical PC</h5><hr />
                <Row className='mt-2'>
                  {
                    Object.keys(criticalPcData).map((key, index) => {
                      return(
                        <Col xs={4} className='mb-2' key={index}>
                          <Card border='dark'>
                            <Card.Body>
                              <Card.Title>{key}</Card.Title><hr />
                              <Accordion key={index}>
                              {
                                Object.keys(criticalPcData[key]).map((pc, index) => {
                                  return(
                                      <Accordion.Item key={index} eventKey={index}>
                                        <Accordion.Header>{pc}</Accordion.Header>
                                        <Accordion.Body>
                                          <Table>
                                            <thead>
                                              <tr>
                                                <th>#</th>
                                                <th>Problem</th>
                                                <th>Status</th>
                                                <th>Link</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                            {
                                              labPcData[key][pc].map((data, index) => {
                                                return(
                                                  <tr key={index}>
                                                    <td>{index+1}</td>
                                                    <td>{data.problem}</td>
                                                    <td>{data.status}</td>
                                                    <td>
                                                      <Link 
                                                        to={`/ticket/${data.id}`}
                                                        params={{ ticketid: data.id }}>
                                                          View
                                                      </Link>
                                                    </td>
                                                  </tr>
                                                )
                                              })
                                            }
                                            </tbody>
                                          </Table>
                                        </Accordion.Body>
                                      </Accordion.Item>
                                  )
                                })
                              }
                              </Accordion>
                            </Card.Body>
                          </Card>
                        </Col>
                      )
                    })
                  }
                </Row>
              </Container>
              <Container fluid className='mb-4'>
                <Accordion defaultActiveKey='0'>
                  <Accordion.Item eventKey='0'>
                    <Accordion.Header>New Issues</Accordion.Header>
                    <Accordion.Body>
                      {
                        ticketsAll.length > 0 ?
                        <>
                        <Form.Control
                          type='input'
                          value={filterP}
                          onChange={(e) => setFilterP(e.target.value)}
                          className='mb-4'
                          placeholder='Type to filter parameters' />
                        {
                          ticketsAll
                          .filter(ticket => ticket.status === 'pending')
                          .filter(ticket => (
                            ticket.problemWith.includes(filterP) ||
                            ticket.problem.includes(filterP) ||
                            ticket.pcNumber === parseInt(filterP)
                          ))
                          .sort((a, b) => {
                            let nonDateA = a.createdAt;
                            let nonDateB = b.createdAt;
                            nonDateA = nonDateA.replaceAll(',','');
                            nonDateA = nonDateA.replace(' at ',' ');
                            nonDateB = nonDateB.replaceAll(',','');
                            nonDateB = nonDateB.replace(' at ',' ');
                            let DateA = new Date(nonDateA);
                            let DateB = new Date(nonDateB);
                            return DateB - DateA;
                          })
                          .map((ticket, index) => {
                            return(
                              <Link 
                                key={index} 
                                style={{
                                  textDecoration: 'none',
                                  color: 'black',
                                }} 
                                to={`/ticket/${ticket.id}`}
                                params={{ ticketid: ticket.id }}>
                                <CardTicket ticket={ticket} />
                              </Link>
                            )
                          })
                        }
                        </> :
                        <>
                          <h5>No issue tickets have been created yet.</h5>
                        </>
                      }
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Container>
              <Container fluid className='mb-4'>
                <Accordion>
                  <Accordion.Item eventKey='0'>
                    <Accordion.Header>Under Process Issues</Accordion.Header>
                    <Accordion.Body>
                      {
                        ticketsAll.length > 0 ?
                        <>
                        <Form.Control
                          type='input'
                          value={filterU}
                          onChange={(e) => setFilterU(e.target.value)}
                          className='mb-4'
                          placeholder='Type to filter parameters' />
                        {
                          ticketsAll
                          .filter(ticket => ticket.status === 'underprocess')
                          .filter(ticket => (
                            ticket.problemWith.includes(filterU) ||
                            ticket.problem.includes(filterU) ||
                            ticket.pcNumber === parseInt(filterU)
                          ))
                          .sort((a, b) => {
                            let nonDateA = a.createdAt;
                            let nonDateB = b.createdAt;
                            nonDateA = nonDateA.replaceAll(',','');
                            nonDateA = nonDateA.replace(' at ',' ');
                            nonDateB = nonDateB.replaceAll(',','');
                            nonDateB = nonDateB.replace(' at ',' ');
                            let DateA = new Date(nonDateA);
                            let DateB = new Date(nonDateB);
                            return DateB - DateA;
                          })
                          .map((ticket, index) => {
                            return(
                              <Link 
                                key={index} 
                                style={{
                                  textDecoration: 'none',
                                  color: 'black',
                                }} 
                                to={`/ticket/${ticket.id}`}
                                params={{ ticketid: ticket.id }}>
                                <CardTicket ticket={ticket} />
                              </Link>
                            )
                          })
                        }
                        </> :
                        <>
                          <h5>No issue tickets have been created yet.</h5>
                        </>
                      }
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Container>
              <Container fluid className='mb-4'>
                <Accordion>
                  <Accordion.Item eventKey='0'>
                    <Accordion.Header>Resolved Issues</Accordion.Header>
                    <Accordion.Body>
                      {
                        ticketsAll.length > 0 ?
                        <>
                        <Form.Control
                          type='input'
                          value={filterR}
                          onChange={(e) => setFilterR(e.target.value)}
                          className='mb-4'
                          placeholder='Type to filter parameters' />
                        {
                          ticketsAll
                          .filter(ticket => ticket.status === 'resolved')
                          .filter(ticket => (
                            ticket.problemWith.includes(filterR) ||
                            ticket.problem.includes(filterR) ||
                            ticket.pcNumber === parseInt(filterR)
                          ))
                          .sort((a, b) => {
                            let nonDateA = a.createdAt;
                            let nonDateB = b.createdAt;
                            nonDateA = nonDateA.replaceAll(',','');
                            nonDateA = nonDateA.replace(' at ',' ');
                            nonDateB = nonDateB.replaceAll(',','');
                            nonDateB = nonDateB.replace(' at ',' ');
                            let DateA = new Date(nonDateA);
                            let DateB = new Date(nonDateB);
                            return DateB - DateA;
                          })
                          .map((ticket, index) => {
                            return(
                              <Link 
                                key={index} 
                                style={{
                                  textDecoration: 'none',
                                  color: 'black',
                                }} 
                                to={`/ticket/${ticket.id}`}
                                params={{ ticketid: ticket.id }}>
                                <CardTicket ticket={ticket} />
                              </Link>
                            )
                          })
                        }
                        </> :
                        <>
                          <h5>No issue tickets have been created yet.</h5>
                        </>
                      }
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Container>
            </>
          }
          {
            currentUser.role === 'lab-incharge' &&
            <>
              <Container fluid className='mb-4'>
                <Row>
                  <Col>
                    <h5 style={{ paddingLeft: '10px' }}>Issue tickets data of All time</h5>
                    {
                      lab.name ?
                      <Card border='dark'>
                      <Card.Body>
                        <Card.Title>{lab.name}</Card.Title><hr />
                        <Card.Text>
                          <b>Total tickets of AC:</b> {ticketData.acTicketCount}<br />
                          <b>Total tickets of PC:</b> {ticketData.pcTicketCount}<br />
                          <b>Total tickets of Fan:</b> {ticketData.fanTicketCount}<br />
                          <b>Total tickets of Light:</b> {ticketData.lightTicketCount}<br />
                          <b>Total tickets of Projector:</b> {ticketData.projectorTicketCount}<br />
                          <b>Total tickets of Printer:</b> {ticketData.printerTicketCount}<br />
                          <b>Total ticketsof Switch Board:</b> {ticketData.switchBoardTicketCount}<br />
                          <b>Total tickets of Table & Chairs:</b> {ticketData.tableTicketCount}
                        </Card.Text>
                      </Card.Body>
                    </Card> :
                      <strong style={{ paddingLeft: '10px' }}>No Lab assigned to you yet.</strong>
                    }
                  </Col>
                  <Col>
                    <h5 style={{ paddingLeft: '10px' }}>PC issues of All time</h5>
                    {
                      lab.name ?
                      <Card border='dark'>
                      <Card.Body>
                        <Card.Title>{lab.name}</Card.Title>
                        <Accordion>
                        {
                          Object.keys(pcData).map((pc, index) => {
                            return(
                                <Accordion.Item key={index} eventKey={index}>
                                  <Accordion.Header>{pc}</Accordion.Header>
                                  <Accordion.Body>
                                    <Table>
                                      <thead>
                                        <tr>
                                          <th>#</th>
                                          <th>Problem</th>
                                          <th>Status</th>
                                          <th>Link</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                      {
                                        pcData[pc].map((data, index) => {
                                          return(
                                            <tr key={index}>
                                              <td>{index+1}</td>
                                              <td>{data.problem}</td>
                                              <td>{data.status}</td>
                                              <td>
                                                <Link 
                                                  to={`/ticket/${data.id}`}
                                                  params={{ ticketid: data.id }}>
                                                    GO
                                                </Link>
                                              </td>
                                            </tr>
                                          )
                                        })
                                      }
                                      </tbody>
                                    </Table>
                                  </Accordion.Body>
                                </Accordion.Item>
                            )
                          })
                        }
                        </Accordion>
                      </Card.Body>
                    </Card>:
                    <strong style={{ paddingLeft: '10px' }}>No Lab assigned to you yet.</strong>
                    }
                  </Col>
                </Row>
              </Container>
              <Container fluid className='mb-4'>
                <Accordion defaultActiveKey='0'>
                  <Accordion.Item eventKey='0'>
                    <Accordion.Header>New Issues</Accordion.Header>
                    <Accordion.Body>
                      {
                        ticketLab.length > 0 ?
                        <>
                        <Form.Control
                          type='input'
                          value={filterP}
                          onChange={(e) => setFilterP(e.target.value)}
                          className='mb-4'
                          placeholder='Type to filter parameters' />
                        {
                          ticketLab
                          .filter(ticket => ticket.status === 'pending')
                          .filter(ticket => (
                            ticket.problemWith.includes(filterP) ||
                            ticket.problem.includes(filterP) ||
                            ticket.pcNumber === parseInt(filterP)
                          ))
                          .sort((a, b) => {
                            let nonDateA = a.createdAt;
                            let nonDateB = b.createdAt;
                            nonDateA = nonDateA.replaceAll(',','');
                            nonDateA = nonDateA.replace(' at ',' ');
                            nonDateB = nonDateB.replaceAll(',','');
                            nonDateB = nonDateB.replace(' at ',' ');
                            let DateA = new Date(nonDateA);
                            let DateB = new Date(nonDateB);
                            return DateB - DateA;
                          })
                          .map((ticket, index) => {
                            return(
                              <Link 
                                key={index} 
                                style={{
                                  textDecoration: 'none',
                                  color: 'black',
                                }} 
                                to={`/ticket/${ticket.id}`}
                                params={{ ticketid: ticket.id }}>
                                <CardTicket ticket={ticket} />
                              </Link>
                            )
                          })
                        }
                        </> :
                        <>
                          <h5>No issue tickets have been created yet.</h5>
                        </>
                      }
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Container>
              <Container fluid className='mb-4'>
                <Accordion>
                  <Accordion.Item eventKey='0'>
                    <Accordion.Header>Under Process Issues</Accordion.Header>
                    <Accordion.Body>
                      {
                        ticketLab.length > 0 ?
                        <>
                        <Form.Control
                          type='input'
                          value={filterU}
                          onChange={(e) => setFilterU(e.target.value)}
                          className='mb-4'
                          placeholder='Type to filter parameters' />
                        {
                          ticketLab
                          .filter(ticket => ticket.status === 'underprocess')
                          .filter(ticket => (
                            ticket.problemWith.includes(filterU) ||
                            ticket.problem.includes(filterU) ||
                            ticket.pcNumber === parseInt(filterU)
                          ))
                          .sort((a, b) => {
                            let nonDateA = a.createdAt;
                            let nonDateB = b.createdAt;
                            nonDateA = nonDateA.replaceAll(',','');
                            nonDateA = nonDateA.replace(' at ',' ');
                            nonDateB = nonDateB.replaceAll(',','');
                            nonDateB = nonDateB.replace(' at ',' ');
                            let DateA = new Date(nonDateA);
                            let DateB = new Date(nonDateB);
                            return DateB - DateA;
                          })
                          .map((ticket, index) => {
                            return(
                              <Link 
                                key={index} 
                                style={{
                                  textDecoration: 'none',
                                  color: 'black',
                                }} 
                                to={`/ticket/${ticket.id}`}
                                params={{ ticketid: ticket.id }}>
                                <CardTicket ticket={ticket} />
                              </Link>
                            )
                          })
                        }
                        </> :
                        <>
                          <h5>No issue tickets have been created yet.</h5>
                        </>
                      }
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Container>
              <Container fluid className='mb-4'>
                <Accordion>
                  <Accordion.Item eventKey='0'>
                    <Accordion.Header>Resolved Issues</Accordion.Header>
                    <Accordion.Body>
                      {
                        ticketLab.length > 0 ?
                        <>
                        <Form.Control
                          type='input'
                          value={filterR}
                          onChange={(e) => setFilterR(e.target.value)}
                          className='mb-4'
                          placeholder='Type to filter parameters' />
                        {
                          ticketLab
                          .filter(ticket => ticket.status === 'resolved')
                          .filter(ticket => (
                            ticket.problemWith.includes(filterR) ||
                            ticket.problem.includes(filterR) ||
                            ticket.pcNumber === parseInt(filterR)
                          ))
                          .sort((a, b) => {
                            let nonDateA = a.createdAt;
                            let nonDateB = b.createdAt;
                            nonDateA = nonDateA.replaceAll(',','');
                            nonDateA = nonDateA.replace(' at ',' ');
                            nonDateB = nonDateB.replaceAll(',','');
                            nonDateB = nonDateB.replace(' at ',' ');
                            let DateA = new Date(nonDateA);
                            let DateB = new Date(nonDateB);
                            return DateB - DateA;
                          })
                          .map((ticket, index) => {
                            return(
                              <Link 
                                key={index} 
                                style={{
                                  textDecoration: 'none',
                                  color: 'black',
                                }} 
                                to={`/ticket/${ticket.id}`}
                                params={{ ticketid: ticket.id }}>
                                <CardTicket ticket={ticket} />
                              </Link>
                            )
                          })
                        }
                        </> :
                        <>
                          <h5>No issue tickets have been created yet.</h5>
                        </>
                      }
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Container>
            </>
          }
        </>
      }
    </div>
  );
}
