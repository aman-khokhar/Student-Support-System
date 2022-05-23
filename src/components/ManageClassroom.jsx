import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Form, Row, Col, Accordion, Spinner } from 'react-bootstrap';
import { firestore } from '../firebase';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ManageClassroom({ match }) {
  const { currentUser } = useAuth();
  const role = currentUser.role;
  const history = useHistory();
  const [loadingPage, setLoadingPage] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const classroomid = match.params.classroomid;
  const [classroom, setClassroom] = useState({});
  const [projectors, setProjectors] = useState({});
  const [pcCompany, setPcCompany] = useState({});
  const [processors, setProcessors] = useState({});
  const [graphicsCard, setGraphicsCard] = useState({});
  const [ups, setUps] = useState({});

  useEffect(() => {
    const unsubProjector = onSnapshot(collection(firestore, 'vendors'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'projector') {
          setProjectors(doc.data());
        }
        return null;
      });
    });
    const unsubProcessors = onSnapshot(collection(firestore, 'vendors'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'processors') {
          setProcessors(doc.data());
        }
        return null;
      });
    });
    const unsubGraphicsCard = onSnapshot(collection(firestore, 'vendors'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'graphicsCard') {
          setGraphicsCard(doc.data());
        }
        return null;
      });
    });
    const unsubups = onSnapshot(collection(firestore, 'vendors'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'ups') {
          setUps(doc.data());
        }
        return null;
      });
    });
    const unsubpc = onSnapshot(collection(firestore, 'vendors'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'pc') {
          setPcCompany(doc.data());
        }
        return null;
      });
    });
    const unsubClassroom = onSnapshot(collection(firestore, 'classrooms'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === classroomid) {
          setClassroom(doc.data());
          setLoadingPage(false);
        }
      });
    });

    return (unsubProjector, unsubProcessors, unsubGraphicsCard, unsubups, unsubpc, unsubClassroom);
  }, []);


  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      const payload = {...classroom};
      const docRef = doc(firestore, 'classrooms', classroomid);
      await setDoc(docRef, payload);
      setSuccess('Changes Commited Successfully.');
    } catch(error) {
      setLoading(false);
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  function handleClassroom(e, property) {
    let item = {...classroom};
    item[property] = e.target.value;
    setClassroom(item);
  }
  function handleAddAC() {
    const acNumber = prompt('Enter Air Conditioner number.');
    if(!acNumber) {
      return null;
    }
    let array = [...classroom.acs];
    for(let i=0; i<acNumber; i++) {
      array.push({
        company: '',
        capacity: '1'
      });
    }
    setClassroom(oldData => ({
      ...oldData,
      acs: array
    }));
  }

  function handleACProperties(e, index, property) {
    let items = [...classroom.acs];
    let item = {...items[index]};
    item[property] = e.target.value;
    items[index] = item;
    setClassroom(oldData => ({
        ...oldData,
        acs: items
      }));
  }

  function handleDeleteAc() {
    setError('');
    const acNumber = prompt('Enter Air Conditioner number.');    
    const acindex = classroom.noAc - acNumber;
    let array = [...classroom.acs];
    if(array.length >= acNumber) {
      array.splice(acindex, acNumber);
      setClassroom(oldData => ({
        ...oldData,
        acs: array
      }));
    } else {
      setError('Cannot Delete Air Conditioners more than available number.');
    }
  }
  function handleCustomTextbox(e, property, operation) {
    if(operation === 'none') {
      let item = classroom[property];
      item = Math.abs(parseInt(e.target.value));
      setClassroom(oldData => ({
        ...oldData,
        [property]: item
      }));
    } else {
      if(operation === '+') {
        let item = classroom[property];
        item = parseInt(item) + 1;
        setClassroom(oldData => ({
          ...oldData,
          [property]: item
        }));
      } else if(operation === '-') {
        let item = classroom[property];
        if(item > 0) {
          item = parseInt(item) - 1;
          setClassroom(oldData => ({
            ...oldData,
            [property]: item
          }));
        }
      }
    }
  }
  function handleProjectorProperties(e, property) {
    let proj = classroom.projector;
    proj[property] = e.target.value;
    setClassroom(oldData => ({
      ...oldData,
      projector: proj
    }));
  }

  function handleUsb(e, operation) {
    if(operation === 'none') {
      let proj = classroom.projector;
      proj.noUSB = Math.abs(parseInt(e.target.value));
      setClassroom(oldData => ({
        ...oldData,
        projector: proj
      }));
    } else {
      if(operation === '+') {
        let proj = classroom.projector;
        proj.noUSB = parseInt(proj.noUSB) + 1;
        setClassroom(oldData => ({
          ...oldData,
          projector: proj
        }));
      } else if(operation === '-') {
        let proj = classroom.projector;
        if(proj.noUSB > 0) {
          proj.noUSB = parseInt(proj.noUSB) - 1;
          setClassroom(oldData => ({
            ...oldData,
            projector: proj
          }));
        }
      }
    }
  }
  function handleRemoveProperty(property) {
    let newClassroom = {...classroom};
    delete newClassroom[property]
    setClassroom(newClassroom);
  }
  function handleAddProjector() {
    setClassroom(oldData => ({
      ...oldData,
      projector: {
        company: 'Epson',
        resolution: '800x600',
        brightness: '',
        inputPort: 'vga',
        noUSB: 0,
      }
    }));
  }
  function handlePcProperties(e, property) {
    let item = {...classroom.pc};
    item[property] = e.target.value;
    setClassroom(oldData => ({
      ...oldData,
      pc: item,
    }));
  }
  function handleAddPC() {
    setClassroom(oldData => ({
      ...oldData,
      pc: {
        name: 'PC 1',
        pcVendor: 'HP',
        os: 'windows',
        processorBrand: 'amd',
        processorVersion: 'Ryzen 3',
        processorGeneration: '',
        graphics: 'integrated',
        graphicsBrand: 'amd',
        graphicsVersion: 'RX 560',
        graphicsMemory: '2',
        ram: '',
        storage: '',
        ups: 'APC by Schneider Electric',
      }
    }));
  }


  return (
    <>
      {(role === 'student' || role === 'lab-incharge' || role === 'hod') && history.push('/')}
      {
        loadingPage &&
        <>
          <div className='text-center'>
            <Spinner animation='border' /><big><strong><p> Loading</p></strong></big>
          </div>
        </>
      }
      {
        (role === 'resource-manager' && !loadingPage) && 
        <>
          <Card className='w-50' style={{ margin: 'auto', padding: '10px' }}>
            <Card.Body>
              {error && <Alert variant='danger'>{error}</Alert>}
              {success && <Alert variant='success'>{success}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group>
                  <Form.Label>Classroom Name</Form.Label>
                  <Form.Control
                    type='input'
                    defaultValue={classroom.name}
                    onChange={(e) => handleClassroom(e, 'name')}
                    required />
                </Form.Group>

                <h4 className='text-center mt-4 mb-1'>Air Conditioner</h4><hr />
                <Button className='w-100 mt-2' onClick={handleAddAC}>Add Air Conditioner</Button>
                {
                  classroom.noAc > 0 &&
                  <>
                    {classroom.acs.map((ac, index) => {
                      return(
                        <div key={index}>
                          <h5 className='mt-2'>AC {index+1}</h5>
                          <Form.Group>
                            <Form.Label>Enter AC company</Form.Label>
                            <Form.Control
                              type='text'
                              defaultValue={ac.company}
                              onChange={(e) => handleACProperties(e, index, 'company')}
                              required />
                          </Form.Group>
                          <Form.Group>
                            <Form.Label>Select AC capacity</Form.Label>
                            <Form.Control
                              as="select"
                              value={ac.capacity}
                              onChange={(e) => handleACProperties(e, index, 'capacity')}
                              required
                            >
                              <option value="1">1 Ton</option>
                              <option value="1.5">1.5 Ton</option>
                              <option value="2">2 Ton</option>
                            </Form.Control>
                          </Form.Group>
                        </div>
                      );
                    })}
                    <Button onClick={handleDeleteAc} className='w-100 mt-4' variant='danger'>
                      Delete Air Conditioners
                    </Button>
                  </>
                }

                <h4 className='text-center mt-4 mb-1'>Board</h4><hr />
                <Form.Group>
                  <Form.Label>Board Color</Form.Label>
                  <Form.Select
                    value={classroom.boardColor}
                    onChange={(e) => handleClassroom(e, 'boardColor')}
                    required >
                      <option value="black">Black Board</option>
                      <option value="white">White Board</option>
                      <option value="green">Green Board</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Board type</Form.Label>
                  <Form.Select
                    value={classroom.boardType}
                    onChange={(e) => handleClassroom(e, 'boardType')}
                    required >
                      <option value="chalk">Chalk Board</option>
                      <option value="marker">Marker Board</option>
                    </Form.Select>
                </Form.Group>

                <h4 className='text-center mt-4 mb-1'>Bench & Table</h4><hr />
                <Row className='mb-2'>
                  <Col xs='4'>
                    <Form.Label>Number of Benches: </Form.Label>
                  </Col>
                  <Col xs='2'>
                    <Button 
                      className='w-50' 
                      onClick={(e) => handleCustomTextbox(e, 'benches', '+')}>+</Button>
                  </Col>
                  <Col xs='4'>
                    <Form.Control 
                      type='text'
                      value={classroom.benches}
                      onChange={(e) => handleCustomTextbox(e, 'benches', 'none')} />
                  </Col>
                  <Col xs='2'>
                    <Button 
                      className='w-50' 
                      onClick={(e) => handleCustomTextbox(e, 'benches', '-')}>-</Button>
                  </Col>
                </Row>
                <Row className='mb-2'>
                  <Col xs='4'>
                    <Form.Label>Number of Tables: </Form.Label>
                  </Col>
                  <Col xs='2'>
                    <Button 
                      className='w-50' 
                      onClick={(e) => handleCustomTextbox(e, 'tables', '+')}>+</Button>
                  </Col>
                  <Col xs='4'>
                    <Form.Control 
                      type='text'
                      value={classroom.tables}
                      onChange={(e) => handleCustomTextbox(e, 'tables', 'none')} />
                  </Col>
                  <Col xs='2'>
                    <Button 
                      className='w-50' 
                      onClick={(e) => handleCustomTextbox(e, 'tables', '-')}>-</Button>
                  </Col>
                </Row>

                <h4 className='text-center mt-4 mb-1'>Projector</h4><hr />
                {
                  classroom.projector ? 
                  <>
                    <Form.Group>
                      <Form.Label>Select Projector Company</Form.Label>
                      <Form.Control
                        as='select'
                        value={classroom.projector.company}
                        onChange={(e) => handleProjectorProperties(e, 'company')}
                        required >
                          {
                            projectors.name.map((company, index) => {
                              return(
                                <option key={index} value={company}>{company}</option>
                              );
                            })
                          }
                      </Form.Control>
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Select Resolution</Form.Label>
                      <Form.Control
                      as='select'
                      value={classroom.projector.resolution}
                      onChange={(e) => handleProjectorProperties(e, 'resolution')}
                      required >
                        <option value='800x600'>800 x 600</option>
                        <option value='1280x720'>1280 x 720</option>
                        <option value='1920x1080'>1920 x 1080</option>
                        <option value='2560x1440'>2560 x 1440</option>
                        <option value='3840x2160'>3840 x 2160</option>
                    </Form.Control>
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Enter Brightness</Form.Label>
                      <Form.Control 
                        type='number' 
                        defaultValue={classroom.projector.brightness}
                        onChange={(e) => handleProjectorProperties(e, 'brightness')}
                        placeholder='in Lumens' 
                        required />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Select Input Port</Form.Label>
                      <Form.Control
                        as='select'
                        value={classroom.projector.inputPort}
                        onChange={(e) => handleProjectorProperties(e, 'inputPort')}
                        required >
                          <option value='vga'>VGA</option>
                          <option value='hdmi'>HDMI</option>
                      </Form.Control>
                    </Form.Group>
                    <Row className='mt-2 mb-2'>
                      <Col xs='4'>
                        <Form.Label>Number of USB Ports: </Form.Label>
                      </Col>
                      <Col xs='2'>
                        <Button 
                          className='w-50'
                          onClick={(e) => handleUsb(e, '+')} >+</Button>
                      </Col>
                      <Col xs='4'>
                        <Form.Control 
                          type='text' 
                          value={classroom.projector.noUSB}
                          onChange={(e) => handleUsb(e, 'none')}
                          required />
                      </Col>
                      <Col xs='2'>
                        <Button 
                          className='w-50'
                          onClick={(e) => handleUsb(e, '-')} >-</Button>
                      </Col>
                    </Row>
                    <Button 
                      className='w-100 mt-2 mb-2' 
                      variant='danger' 
                      onClick={() => handleRemoveProperty('projector')} >Remove Projector</Button>
                  </> : <>
                    <Button 
                      className='w-100 mt-2 mb-2'
                      onClick={handleAddProjector} >Add Projector</Button>
                  </>
                }

                <h4 className='text-center mt-4 mb-1'>PC</h4><hr />
                {
                  classroom.pc ?
                  <>
                    <Form.Group>
                      <Form.Label>Select PC vendor</Form.Label>
                      <Form.Control
                        as='select'
                        value={classroom.pc.pcVendor}
                        onChange={(e) => handlePcProperties(e, 'pcVendor')}
                        required>
                          {pcCompany.name.map((company, index) => {
                            return(
                              <option key={index} value={company}>{company}</option>
                            );
                          })}
                      </Form.Control>
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Operating System</Form.Label>
                      <Form.Control
                        as="select"
                        value={classroom.pc.os}
                        onChange={(e) => handlePcProperties(e, 'os')}
                        required
                      >
                        <option value="windows">Windows 10</option>
                        <option value="linux">Linux</option>
                        <option value="dual">Both Windows 10 & Linux (Dual Boot)</option>
                      </Form.Control>
                    </Form.Group>
                    <Row>
                      <Col xs='4'><Form.Label>Brand</Form.Label></Col>
                      <Col xs='4'><Form.Label>Version</Form.Label></Col>
                      <Col xs='4'><Form.Label>Generation</Form.Label></Col>
                    </Row>
                    <Row>
                      <Col xs='4'>
                          <Form.Control
                            as='select'
                            value={classroom.pc.processorBrand}
                            onChange={(e) => handlePcProperties(e, 'processorBrand')}
                            required>
                              {Object.keys(processors).map((key, index) => {
                                return(
                                  <option key={index} value={key}>{key}</option>
                                );
                              })}
                          </Form.Control>
                      </Col>
                      <Col xs='4'>
                          <Form.Control
                            as='select'
                            value={classroom.pc.processorVersion}
                            onChange={(e) => handlePcProperties(e, 'processorVersion')}
                            required>
                              {processors[classroom.pc.processorBrand].map((version, index) => {
                                return(
                                  <option key={index} value={version}>{version}</option>
                                );
                              })}
                          </Form.Control>
                      </Col>
                      <Col xs='4'>
                          <Form.Control 
                            type='text' 
                            placeholder='Generation of processor' 
                            value={classroom.pc.processorGeneration}
                            onChange={(e) => handlePcProperties(e, 'processorGeneration')}
                            required />
                      </Col>
                    </Row>
                    <Form.Group>
                      <Form.Label>Graphics</Form.Label>
                      <Form.Control
                        as="select"
                        value={classroom.pc.graphics}
                        onChange={(e) => handlePcProperties(e, 'graphics')}
                        required
                      >
                        <option value="integrated">Integrated</option>
                        <option value="discrete">Discrete</option>
                      </Form.Control>
                    </Form.Group>
                    {
                      classroom.pc.graphics === 'discrete' &&
                      <>
                        <Row>
                          <Col xs='4'><Form.Label>Brand</Form.Label></Col>
                          <Col xs='4'><Form.Label>Graphics Card</Form.Label></Col>
                          <Col xs='4'><Form.Label>Graphics Memory</Form.Label></Col>
                        </Row>
                        <Row>
                          <Col  xs='4'>
                            <Form.Control
                              as='select'
                              value={classroom.pc.graphicsBrand}
                              onChange={(e) => handlePcProperties(e, 'graphicsBrand')}
                              required>
                                {Object.keys(graphicsCard).map((key, index) => {
                                  return(
                                    <option key={index} value={key}>{key}</option>
                                  );
                                })}
                            </Form.Control>
                          </Col>
                          <Col xs='4'>
                            <Form.Control
                              as='select'
                              value={classroom.pc.graphicsVersion}
                              onChange={(e) => handlePcProperties(e, 'graphicsVersion')}
                              required>
                                {graphicsCard[classroom.pc.graphicsBrand].map((version, index) => {
                                  return(
                                    <option key={index} value={version}>{version}</option>
                                  );
                                })}
                            </Form.Control>
                          </Col>
                          <Col xs='4'>
                            <Form.Control
                              as='select'
                              value={classroom.pc.graphicsMemory}
                              onChange={(e) => handlePcProperties(e, 'graphicsMemory')}
                              required>
                                <option value='2'>2 GB</option>
                                <option value='4'>4 GB</option>
                                <option value='8'>8 GB</option>
                                <option value='16'>16 GB</option>
                            </Form.Control>
                          </Col>
                        </Row>
                      </>
                    }
                    <Form.Group id='ram'>
                      <Form.Label>RAM</Form.Label>
                      <Form.Control 
                        type='text' 
                        value={classroom.pc.ram} 
                        onChange={(e) => handlePcProperties(e, 'ram')}
                        placeholder='in GB' 
                        required />
                    </Form.Group>
                    <Form.Group id='storage'>
                      <Form.Label>Storage</Form.Label>
                      <Form.Control 
                        type='text' 
                        value={classroom.pc.storage} 
                        onChange={(e) => handlePcProperties(e, 'storage')}
                        placeholder='in GB' 
                        required />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Select UPS Company</Form.Label>
                      <Form.Control
                        as='select'
                        value={classroom.pc.ups}
                        onChange={(e) => handlePcProperties(e, 'ups')}
                        required>
                          {ups.name.map((company, index) => {
                            return(
                              <option key={index} value={company}>{company}</option>
                            )
                          })}
                      </Form.Control>
                    </Form.Group>
                    <Button 
                      className='w-100 mt-2 mb-2' 
                      variant='danger' 
                      onClick={() => handleRemoveProperty('pc')} >Remove PC</Button>
                  </> : <>
                    <Button 
                      className='w-100 mt-2 mb-2'
                      onClick={handleAddPC} >Add PC</Button>
                  </>
                }

                <Button disabled={loading} className='w-100 mt-4' type='submit'>
                  Commit Changes
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </>
      }
    </>
  )
}
