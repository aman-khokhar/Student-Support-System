import React, { useEffect, useRef, useState } from 'react';
import { Card, Form, Alert, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useHistory, Link } from 'react-router-dom';
import { firestore } from '../firebase';
import { collection, onSnapshot, addDoc } from "firebase/firestore";

export default function CreateClassroom() {
  const history = useHistory();
  const { currentUser } = useAuth();
  const role = currentUser.role;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [loadingPage, setLoadingPage] = useState(true);

  const classroomNameRef = useRef();
  const [acs, setACs] = useState([]);
  const [acCompany, setAcCompany] = useState('');
  const [acTon, setAcTon] = useState('1');
  const [allSameAC, setAllSameAC] = useState(false);
  const boardColorRef = useRef();
  const boardTypeRef = useRef();
  const [benches, setBenches] = useState(0);
  const [tables, setTables] = useState(0);
  const [projectors, setProjectors] = useState({});
  const [projectorVariant, setProjectorVariant] = useState('primary');
  const [projectorButtonValue, setProjectorButtonValue] = useState('Add Projector');
  const [addProjector, setAddProjector] = useState(false);
  const [selectedProjector, setSelectedProjector] = useState({
    company: 'Epson',
    resolution: '800x600',
    brightness: '',
    inputPort: 'vga',
    noUSB: 0,
  });
  const [pcVariant, setPcVariant] = useState('primary');
  const [pcButtonValue, setPcButtonValue] = useState('Add PC');
  const [addPc, setAddPc] = useState(false);
  const [selectedPc, setSelectedPc] = useState({
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
  });
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
          setLoadingPage(false);
        }
        return null;
      });
    });

    return (unsubProjector, unsubProcessors, unsubGraphicsCard, unsubups, unsubpc);
  }, []);

  async function handleSubmit(e) {
    setError('');
    setSuccess('');
    e.preventDefault();

    let classroom = {};
    let allACs = [];
    let isProjector = {};
    let isPc = {};
    if(allSameAC) {
      const length = acs.length;
      for(let i=0; i<length; i++) {
        allACs[i] = {
          company: acCompany,
          capacity: acTon,
        };
      }
    } 
    if(!allSameAC) {
      allACs = [...acs];
    }
    if(addProjector) {
      isProjector = {
        projector: selectedProjector,
      }
    }
    if(addPc) {
      isPc = {
        pc: selectedPc,
      }
    }

    try {
      setLoading(true);
      classroom = {
        name: classroomNameRef.current.value,
        noAc: acs.length,
        acs: [...allACs],
        boardColor: boardColorRef.current.value,
        boardTypeRef: boardTypeRef.current.value,
        ...isProjector,
        ...isPc,
        benches,
        tables,
      }
      const collectionRef = collection(firestore, 'classrooms');
      const payload = {...classroom};
      await addDoc(collectionRef, payload);
      setSuccess('Classroom Created Successfully');
    } catch(error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  function handleAddAC() {
    const acNumber = prompt('Enter Air Conditioner number.');
    if(!acNumber) {
      return null;
    }
    for(let i=0; i<acNumber; i++) {
      setACs(oldData => [...oldData, {
        company: '',
        capacity: '1'
      }]);
    }
  }

  function handleACProperties(e, index, property) {
    let items = [...acs];
    let item = {...items[index]};
    item[property] = e.target.value;
    items[index] = item;
    setACs(items);
  }

  function handleDeleteAc() {
    setError('');
    const acNumber = prompt('Enter Air Conditioner number.');    
    const acindex = acs.length - acNumber;
    let array = [...acs];
    if(array.length >= acNumber) {
      array.splice(acindex, acNumber)
      setACs(array);
    } else {
      setError('Cannot Delete Air Conditioners more than available number.');
    }
  }
  function handleProjectorProperties(e, property) {
    let proj = selectedProjector;
    proj[property] = e.target.value;
    setSelectedProjector({...proj});
  }
  function handlePcProperties(e, property) {
    let pc = selectedPc;
    pc[property] = e.target.value;
    setSelectedPc({...pc});
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
        <Card className='w-50' style={{ margin: 'auto', padding: '10px' }}>
          <Card.Body>
            {error && <Alert variant='danger'>{error}</Alert>}
            {success && <Alert variant='success'>{success}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Label>Classroom Name</Form.Label>
                <Form.Control type='text' ref={classroomNameRef} required />
              </Form.Group>

              <h4 className='text-center mt-4 mb-1'>Air Conditioner</h4><hr />
              <Form.Label>Number of Air Conditioners: {acs.length}</Form.Label>
              <Button className='w-100 mt-2' onClick={handleAddAC}>Add Air Conditioner</Button>
              {
                acs.length > 0 &&
                <>
                  <Form.Group id='all-same-ac'>
                    <Form.Check 
                      label='ACs all same?' 
                      type='switch'
                      checked={allSameAC}
                      className='mt-2'
                      onChange={(e) => setAllSameAC(e.target.checked)}
                    />
                  </Form.Group>
                  {
                    allSameAC &&
                    <>
                      <Form.Group>
                        <Form.Label>Enter AC company</Form.Label>
                        <Form.Control 
                          type='text' 
                          value={acCompany}
                          onChange={(e) => setAcCompany(e.target.value)} 
                          required />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Select AC capacity</Form.Label>
                        <Form.Control
                          as="select"
                          value={acTon}
                          onChange={(e) => setAcTon(e.target.value)}
                          required
                        >
                          <option value="1">1 Ton</option>
                          <option value="1.5">1.5 Ton</option>
                          <option value="2">2 Ton</option>
                        </Form.Control>
                      </Form.Group>
                    </>
                  }
                  {
                    !allSameAC &&
                    acs.map((ac, index) => {
                      return(
                        <div key={index}>
                          <h5 className='mt-2'>AC {index+1}</h5>
                          <Form.Group>
                            <Form.Label>Enter AC company</Form.Label>
                            <Form.Control
                              type='text'
                              value={ac.company}
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
                    })
                  }
                  <Button onClick={handleDeleteAc} className='w-100 mt-4' variant='danger'>
                    Delete Air Conditioners
                  </Button>
                </>
              }

              <h4 className='text-center mt-4 mb-1'>Board</h4><hr />
              <Form.Group>
                <Form.Label>Board Color</Form.Label>
                <Form.Control
                  as="select"
                  ref={boardColorRef}
                  required >
                  <option value="black">Black Board</option>
                  <option value="white">White Board</option>
                  <option value="green">Green Board</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Board type</Form.Label>
                <Form.Control
                  as="select"
                  ref={boardTypeRef}
                  required >
                  <option value="chalk">Chalk Board</option>
                  <option value="marker">Marker Board</option>
                </Form.Control>
              </Form.Group>

              <h4 className='text-center mt-4 mb-1'>Bench & Table</h4><hr />
              <Row className='mb-2'>
                <Col xs='4'>
                  <Form.Label>Number of Benches: </Form.Label>
                </Col>
                <Col xs='2'>
                  <Button 
                    className='w-50' 
                    onClick={() => setBenches(benches+1)}>+</Button>
                </Col>
                <Col xs='4'>
                  <Form.Control 
                    type='text'
                    value={Math.abs(benches)}
                    onChange={(e) => setBenches(Math.abs(parseInt(e.target.value)))} />
                </Col>
                <Col xs='2'>
                  <Button 
                    className='w-50' 
                    onClick={() => {benches > 0 && setBenches(benches-1)}}>-</Button>
                </Col>
              </Row>
              <Row className='mb-2'>
                <Col xs='4'>
                  <Form.Label>Number of Tables: </Form.Label>
                </Col>
                <Col xs='2'>
                  <Button 
                    className='w-50' 
                    onClick={() => setTables(tables+1)}>+</Button>
                </Col>
                <Col xs='4'>
                  <Form.Control 
                    type='text'
                    value={Math.abs(tables)}
                    onChange={(e) => setTables(Math.abs(parseInt(e.target.value)))} />
                </Col>
                <Col xs='2'>
                  <Button 
                    className='w-50' 
                    onClick={() => {tables > 0 && setTables(tables-1)}}>-</Button>
                </Col>
              </Row>

              <h4 className='text-center mt-4 mb-1'>Projector</h4><hr />
              <Button 
                className='w-100 mb-2'
                variant={projectorVariant}
                onClick={() => {
                  setAddProjector(!addProjector);
                  if(addProjector) {
                    setProjectorButtonValue('Add Projector');
                    setProjectorVariant('primary');
                    setSelectedProjector({
                      company: 'Epson',
                      resolution: '800x600',
                      brightness: '',
                      inputPort: 'vga',
                      noUSB: 0,
                    });
                  } else {
                    setProjectorButtonValue('Remove Projector');
                    setProjectorVariant('danger');
                  }
                }} >
                  {projectorButtonValue}
              </Button>
              {
                addProjector &&
                <>
                  <Form.Group>
                    <Form.Label>Select Projector Company</Form.Label>
                    <Form.Control
                      as='select'
                      value={selectedProjector.company}
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
                    value={selectedProjector.resolution}
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
                      value={selectedProjector.brightness}
                      onChange={(e) => handleProjectorProperties(e, 'brightness')}
                      placeholder='in Lumens' 
                      required />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Select Input Port</Form.Label>
                    <Form.Control
                      as='select'
                      value={selectedProjector.inputPort}
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
                        onClick={() => {
                          setSelectedProjector((oldData) => ({
                            ...oldData,
                            noUSB: oldData.noUSB+1,
                          }))
                        }} >+</Button>
                    </Col>
                    <Col xs='4'>
                      <Form.Control 
                        type='text' 
                        value={Math.abs(selectedProjector.noUSB)}
                        onChange={(e) => {
                          setSelectedProjector((oldData) => ({
                            ...oldData,
                            noUSB: Math.abs(parseInt(e.target.value)),
                          }))
                        }}
                        required />
                    </Col>
                    <Col xs='2'>
                      <Button 
                        className='w-50'
                        onClick={() => {
                          selectedProjector.noUSB > 0 &&
                          setSelectedProjector((oldData) => ({
                            ...oldData,
                            noUSB: oldData.noUSB-1,
                          }))
                        }} >-</Button>
                    </Col>
                  </Row>
                </>
              }

              <h4 className='text-center mt-4 mb-1'>PC</h4><hr />
              <Button 
                className='w-100 mb-2'
                variant={pcVariant}
                onClick={() => {
                  setAddPc(!addPc);
                  if(addPc) {
                    setPcButtonValue('Add PC');
                    setPcVariant('primary');
                    setSelectedPc({
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
                    });
                  } else {
                    setPcButtonValue('Remove PC');
                    setPcVariant('danger');
                  }
                }} >
                  {pcButtonValue}
              </Button>
              {
                addPc &&
                <>
                  <Form.Group>
                    <Form.Label>Select PC vendor</Form.Label>
                    <Form.Control
                      as='select'
                      value={selectedPc.pcVendor}
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
                      value={selectedPc.os}
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
                          value={selectedPc.processorBrand}
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
                          value={selectedPc.processorVersion}
                          onChange={(e) => handlePcProperties(e, 'processorVersion')}
                          required>
                            {processors[selectedPc.processorBrand].map((version, index) => {
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
                          value={selectedPc.processorGeneration}
                          onChange={(e) => handlePcProperties(e, 'processorGeneration')}
                          required />
                    </Col>
                  </Row>
                  <Form.Group>
                    <Form.Label>Graphics</Form.Label>
                    <Form.Control
                      as="select"
                      value={selectedPc.graphics}
                      onChange={(e) => handlePcProperties(e, 'graphics')}
                      required
                    >
                      <option value="integrated">Integrated</option>
                      <option value="discrete">Discrete</option>
                    </Form.Control>
                  </Form.Group>
                  {
                    selectedPc.graphics === 'discrete' &&
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
                            value={selectedPc.graphicsBrand}
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
                            value={selectedPc.graphicsVersion}
                            onChange={(e) => handlePcProperties(e, 'graphicsVersion')}
                            required>
                              {graphicsCard[selectedPc.graphicsBrand].map((version, index) => {
                                return(
                                  <option key={index} value={version}>{version}</option>
                                );
                              })}
                          </Form.Control>
                        </Col>
                        <Col xs='4'>
                          <Form.Control
                            as='select'
                            value={selectedPc.graphicsMemory}
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
                      value={selectedPc.ram} 
                      onChange={(e) => handlePcProperties(e, 'ram')}
                      placeholder='in GB' 
                      required />
                  </Form.Group>
                  <Form.Group id='storage'>
                    <Form.Label>Storage</Form.Label>
                    <Form.Control 
                      type='text' 
                      value={selectedPc.storage} 
                      onChange={(e) => handlePcProperties(e, 'storage')}
                      placeholder='in GB' 
                      required />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Select UPS Company</Form.Label>
                    <Form.Control
                      as='select'
                      value={selectedPc.ups}
                      onChange={(e) => handlePcProperties(e, 'ups')}
                      required>
                        {ups.name.map((company, index) => {
                          return(
                            <option key={index} value={company}>{company}</option>
                          )
                        })}
                    </Form.Control>
                  </Form.Group>
                </>
              }

              <Button disabled={loading} className='w-100 mt-4' type='submit'>
                Create
              </Button>
            </Form>
          </Card.Body>
        </Card>
      }
    </>
  );
}