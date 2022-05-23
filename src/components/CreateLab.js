import React, { useEffect, useRef, useState } from 'react';
import { Card, Form, Alert, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useHistory, Link } from 'react-router-dom';
import { firestore } from '../firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc } from "firebase/firestore";
import RangeSlider from 'react-bootstrap-range-slider';

export default function CreateLab() {
  const history = useHistory();
  const { currentUser } = useAuth();
  const role = currentUser.role;
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  const labNameRef = useRef();
  const osRef = useRef();
  const labInchargeRef = useRef();
  const ramRef = useRef();
  const storageRef = useRef();
  const acCompanyRef = useRef();
  const acTonRef = useRef();
  const pcCompanyRef = useRef();
  const generationRef = useRef();
  const processorVersionRef= useRef();
  const graphicsVersionRef = useRef();
  const upsRef = useRef();
  const graphicsMemoryRef = useRef();
  const printerCompanyRef = useRef();

  const [numberOfPCs, setNumberOfPCs] = useState(1);
  const [allSame, setAllSame] = useState(true);
  const [lights, setLights] = useState(0);
  const [fans, setFans] = useState(0);
  const [cupboards, setCupboards] = useState(0);
  const [tableAndChair, setTableAndChairs] = useState(0);
  const [labIncharges, setLabIncharges] = useState([]);
  const [acs, setACs] = useState([]);
  const [allSameAC, setAllSameAC] = useState(false);
  const [processors, setProcessors] = useState({});
  const [graphicsCard, setGraphicsCard] = useState({});
  const [ups, setUps] = useState({});
  const [pcCompany, setPcCompany] = useState({});
  const [processorBrand, setProcessorBrand] = useState('amd');
  const [graphics, setGraphics] = useState('integrated');
  const [graphicsBrand, setGraphicsBrand] = useState('amd');
  const [projectors, setProjectors] = useState({});
  const [projectorVariant, setProjectorVariant] = useState('primary');
  const [projectorButtonValue, setProjectorButtonValue] = useState('Add Projector');
  const [addProjector, setAddProjector] = useState(false);
  const [addPrinter, setAddPrinter] = useState(false);
  const [printerVariant, setPrinterVariant] = useState('primary');
  const [printerButtonValue, setPrinterButtonValue] = useState('Add Printer');
  const [printers, setPrinters] = useState({});
  const [routers, setRouters] = useState({});
  const [addRouter, setAddRouter] = useState(false);
  const [routerVariant, setRouterVariant] = useState('primary');
  const [routerButtonValue, setRouterButtonValue] = useState('Add Router');
  const [switchs, setSwitchs] = useState({});
  const [addSwitch, setAddSwitch] = useState(false);
  const [switchVariant, setSwitchVariant] = useState('primary');
  const [switchButtonValue, setSwitchButtonValue] = useState('Add Network Switch');
  const [pcs, setPCs] = useState([
    {
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
    },
  ]);
  const [selectedProjector, setSelectedProjector] = useState({
    company: 'Epson',
    resolution: '800x600',
    brightness: '',
    inputPort: 'vga',
    noUSB: 0,
  });
  const [selectedRouter, setSelectedRouter] = useState({
    company: 'TP-Link',
    band: '2',
    noLAN: 0,
    noWAN: 0,
  });
  const [selectedSwitch, setSelectedSwitch] = useState({
    company: 'TP-Link',
    speed: '',
    noPorts: 0,
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, 'users'), (snapshot) => {
      setLabIncharges(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})).filter(doc => doc.role==='lab-incharge'));
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
    const unsubProjector = onSnapshot(collection(firestore, 'vendors'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'projector') {
          setProjectors(doc.data());
        }
        return null;
      });
    });
    const unsubPrinter = onSnapshot(collection(firestore, 'vendors'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'printer') {
          setPrinters(doc.data());
        }
        return null;
      });
    });
    const unsubRouter = onSnapshot(collection(firestore, 'vendors'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'router') {
          setRouters(doc.data());
        }
        return null;
      });
    });
    const unsubSwitch = onSnapshot(collection(firestore, 'vendors'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'switch') {
          setSwitchs(doc.data());
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
    return (unsub, unsubProcessors, unsubGraphicsCard, unsubups, unsubpc, unsubProjector, unsubPrinter, unsubRouter, unsubSwitch);
  }, []);

  async function handleSubmit(e) {
    setError('');
    setSuccess('');
    e.preventDefault();
    let lab = {};
    let allPCs = [];
    let allACs = [];
    let periphObj = {};
    let graphicsObj = {};
    if(allSame) {
      const pcVendor = pcCompanyRef.current.value;
      const os = osRef.current.value;
      const processorGeneration = generationRef.current.value;
      const processorVersion = processorVersionRef.current.value;
      if(graphics === 'discrete') {
        const graphicsVersion = graphicsVersionRef.current.value;
        const graphicsMemory = graphicsMemoryRef.current.value;
        graphicsObj = {
          graphics,
          graphicsBrand,
          graphicsVersion,
          graphicsMemory,
        }
      } else {
        graphicsObj = {
          graphics,
        }
      }
      const ram = ramRef.current.value;
      const storage = storageRef.current.value;
      const ups = upsRef.current.value;
      const length = numberOfPCs;
      for(let i=0; i<length; i++) {
        allPCs.push({
          name: `PC ${i+1}`,
          pcVendor,
          os,
          processorBrand,
          processorVersion,
          processorGeneration,
          ...graphicsObj,
          ram,
          storage,
          ups,
        });
      }
    } else {
      allPCs = [...pcs];
    }
    if(allSameAC) {
      const acCompany = acCompanyRef.current.value;
      const capacity = acTonRef.current.value;
      const length = acs.length;
      for(let i=0; i<length; i++) {
        allACs.push({
          acCompany,
          capacity,
        });
      }
    } else {
      allACs = [...acs];
    }
    if(addProjector) {
      periphObj = {...periphObj, projector: selectedProjector};
    }
    if(addPrinter) {
      periphObj = {...periphObj, printerCompany: printerCompanyRef.current.value};
    }
    if(addSwitch) {
      periphObj = {...periphObj, switch: selectedSwitch};
    }
    if(addRouter) {
      periphObj = {...periphObj, router: selectedRouter};
    } 
    try {
      setLoading(true);
      lab = {
        name: labNameRef.current.value,
        labIncharge: labInchargeRef.current.value,
        noAc: acs.length,
        acs: [...allACs],
        noPcs: allPCs.length,
        pcs: [...allPCs],
        ...periphObj,
        noLight: lights,
        noFan: fans,
        noCupboard: cupboards,
        noTableChair: tableAndChair,
      };
      const collectionRef = collection(firestore, 'labs');
      const payload = {...lab};
      const labRef = await addDoc(collectionRef, payload);
      let selectedLabIncharge = labIncharges.filter(incharge => incharge.name === labInchargeRef.current.value)[0];
      const docRefNew = doc(firestore, 'users', selectedLabIncharge.id);
      await updateDoc(docRefNew, {
        labId: labRef.id
      })
      setSuccess('Lab Added Successfully');
    } catch(error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  function handlePCProperties(e, index, property) {
    let items = [...pcs];
    let item = {...items[index]};
    item[property] = e.target.value;
    items[index] = item;
    setPCs(items);
  }
  function handleAllSame(e) {
    setAllSame(e.target.checked);
  }
  function handleRemove(index) {
    let array = [...pcs];
    if(array.length > 1) {
      array.splice(index, 1)
      setPCs(array);
    }
  }
  function handleAddPc() {
    setPCs(oldArray => [...oldArray, {
      name: `PC ${pcs.length+1}`,
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
    }]);
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

  return (
    <div>
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
            <Form.Group id='lab-name'>
              <Form.Label>Lab Name</Form.Label>
              <Form.Control type='text' ref={labNameRef} required />
            </Form.Group>
            <Form.Group id='lab-incharge'>
              <Form.Label>Lab incharge</Form.Label>
              <Form.Control
                as="select"
                ref={labInchargeRef}
                required
              >
                {labIncharges
                .filter(incharge => !incharge.labId)
                .map((labIncharge, index) => {
                  return(
                    <option key={index} value={labIncharge.name}>{labIncharge.name}</option>
                  )
                })}
              </Form.Control>
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
                      <Form.Control type='text' ref={acCompanyRef} required />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Select AC capacity</Form.Label>
                      <Form.Control
                        as="select"
                        ref={acTonRef}
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

            <h4 className='text-center mt-4 mb-1'>PC</h4>
            <Form.Group id='all-same'>
              <Form.Check 
                label='PCs all same?' 
                type='switch'
                checked={allSame}
                className='mt-2'
                onChange={handleAllSame}
              />
            </Form.Group>
            {
              allSame && 
              <>
                <Form.Group id='number-pc' className='mt-1'>
                  <Form.Label>Number of Pcs</Form.Label>
                  <RangeSlider
                    value={numberOfPCs}
                    min={1}
                    max={120}
                    onChange={e => {
                      setNumberOfPCs(e.target.value);
                      setTableAndChairs(parseInt(e.target.value)+2);
                    }}
                    tooltip='auto'
                  />
                </Form.Group>
              </>
            }
            <h5 className='mt-4 mb-1'>PC Configuration</h5><hr />
            { 
              allSame && 
              <>
                <Form.Group>
                  <Form.Label>Select PC vendor</Form.Label>
                  <Form.Control
                    as='select'
                    ref={pcCompanyRef}
                    required>
                      {pcCompany.name.map((company, index) => {
                        return(
                          <option key={index} value={company}>{company}</option>
                        );
                      })}
                  </Form.Control>
                </Form.Group>
                <Form.Group id='os'>
                  <Form.Label>Operating System</Form.Label>
                  <Form.Control
                    as="select"
                    ref={osRef}
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
                        value={processorBrand}
                        onChange={(e) => setProcessorBrand(e.target.value)}
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
                        ref={processorVersionRef}
                        required>
                          {processors[processorBrand].map((version, index) => {
                            return(
                              <option key={index} value={version}>{version}</option>
                            );
                          })}
                      </Form.Control>
                  </Col>
                  <Col xs='4'>
                      <Form.Control type='text' placeholder='Generation of processor' ref={generationRef} required />
                  </Col>
                </Row>
                <Form.Group>
                  <Form.Label>Graphics</Form.Label>
                  <Form.Control
                    as="select"
                    value={graphics}
                    onChange={(e) => setGraphics(e.target.value)}
                    required
                  >
                    <option value="integrated">Integrated</option>
                    <option value="discrete">Discrete</option>
                  </Form.Control>
                </Form.Group>
                {
                  graphics === 'discrete' &&
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
                          value={graphicsBrand}
                          onChange={(e) => setGraphicsBrand(e.target.value)}
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
                          ref={graphicsVersionRef}
                          required>
                            {graphicsCard[graphicsBrand].map((version, index) => {
                              return(
                                <option key={index} value={version}>{version}</option>
                              );
                            })}
                        </Form.Control>
                      </Col>
                      <Col xs='4'>
                        <Form.Control
                          as='select'
                          ref={graphicsMemoryRef}
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
                  <Form.Control type='text' ref={ramRef} placeholder='in GB' required />
                </Form.Group>
                <Form.Group id='storage'>
                  <Form.Label>Storage</Form.Label>
                  <Form.Control type='text' ref={storageRef} placeholder='in GB' required />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Select UPS Company</Form.Label>
                  <Form.Control
                    as='select'
                    ref={upsRef}
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
            {
              !allSame &&
              pcs.map((pc, index) => {
                return(
                  <div key={index}>
                    <h5 className='mt-2'>PC {index+1}</h5>
                    <Form.Group id={`pcVendor${index}`}>
                      <Form.Label>Select PC vendor</Form.Label>
                      <Form.Control
                        as='select'
                        value={pc.pcVendor}
                        onChange={(e) => handlePCProperties(e, index, 'pcVendor')}
                        required>
                          {pcCompany.name.map((company, index) => {
                            return(
                              <option key={index} value={company}>{company}</option>
                            );
                          })}
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
                            value={pc.processorBrand}
                            onChange={(e) => handlePCProperties(e, index, 'processorBrand')}
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
                            value={pc.processorVersion}
                            onChange={(e) => handlePCProperties(e, index, 'processorVersion')}
                            required>
                              {processors[pc.processorBrand].map((version, index) => {
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
                            value={pc.processorGeneration}
                            onChange={(e) => handlePCProperties(e, index, 'processorGeneration')}
                            required />
                      </Col>
                    </Row>
                    <Form.Group id={`os${index}`}>
                      <Form.Label>Operating System</Form.Label>
                      <Form.Control
                        as="select"
                        value={pc.os}
                        onChange={(e) => handlePCProperties(e, index, 'os')}
                        required
                      >
                        <option value="windows">Windows 10</option>
                        <option value="linux">Linux</option>
                        <option value="dual">Both Windows 10 & Linux (Dual Boot)</option>
                      </Form.Control>
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Graphics</Form.Label>
                      <Form.Control
                        as="select"
                        value={pc.graphics}
                        onChange={(e) => handlePCProperties(e, index, 'graphics')}
                        required
                      >
                        <option value="integrated">Integrated</option>
                        <option value="discrete">Discrete</option>
                      </Form.Control>
                    </Form.Group>
                    {
                      pc.graphics === 'discrete' &&
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
                              value={pc.graphicsBrand}
                              onChange={(e) => handlePCProperties(e, index, 'graphicsBrand')}
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
                              value={pc.graphicsVersion}
                              onChange={(e) => handlePCProperties(e, index, 'graphicsVersion')}
                              required>
                                {graphicsCard[pc.graphicsBrand].map((version, index) => {
                                  return(
                                    <option key={index} value={version}>{version}</option>
                                  );
                                })}
                            </Form.Control>
                          </Col>
                          <Col xs='4'>
                            <Form.Control
                              as='select'
                              value={pc.graphicsMemory}
                              onChange={(e) => handlePCProperties(e, index, 'graphicsMemory')}
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
                    <Form.Group id={`ram${index}`}>
                      <Form.Label>RAM</Form.Label>
                      <Form.Control 
                        type='text' 
                        value={pc.ram} 
                        placeholder='in GB' 
                        required
                        onChange={(e) => handlePCProperties(e, index, 'ram')}
                      />
                    </Form.Group>
                    <Form.Group id={`storage${index}`}>
                      <Form.Label>Storage</Form.Label>
                      <Form.Control 
                        type='text' 
                        value={pc.storage} 
                        placeholder='in GB' 
                        required 
                        onChange={(e) => handlePCProperties(e, index, 'storage')}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Select UPS Company</Form.Label>
                      <Form.Control
                        as='select'
                        value={pc.ups}
                        onChange={(e) => handlePCProperties(e, index, 'ups')}
                        required>
                          {ups.name.map((company, index) => {
                            return(
                              <option key={index} value={company}>{company}</option>
                            )
                          })}
                      </Form.Control>
                    </Form.Group>
                    <Button 
                      id={`btn${index}`} 
                      className='w-100 mt-2'
                      variant='danger'
                      onClick={() => handleRemove(index)}
                    >
                      Remove
                    </Button>
                  </div>
                );
              })
            }
            {
              !allSame &&
              <>
                <Button className='w-100 mt-2' onClick={handleAddPc}>Add PC</Button>
              </>
            }

            <h4 className='text-center mt-4 mb-1'>Peripherals</h4>
            <h5 className='mb-1'>Projector</h5><hr />
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
            <h5 className='mb-1'>Printer</h5><hr />
            <Button 
              className='w-100 mb-2'
              variant={printerVariant}
              onClick={() => {
                setAddPrinter(!addPrinter);
                if(addPrinter) {
                  setPrinterButtonValue('Add Printer');
                  setPrinterVariant('primary');
                } else {
                  setPrinterButtonValue('Remove Printer');
                  setPrinterVariant('danger');
                }
              }} >
                {printerButtonValue}
            </Button>
            {
              addPrinter &&
              <>
                <Form.Group>
                  <Form.Label>Select Printer Company</Form.Label>
                  <Form.Control
                    as='select'
                    ref={printerCompanyRef}
                    required>
                      {
                        printers.name.map((company, index) => {
                          return(
                            <option key={index} value={company}>{company}</option>
                          )
                        })
                      }
                  </Form.Control>
                </Form.Group>
              </>
            }
            <h5 className='mt-2 mb-1'>Network Switch</h5><hr />
            <Button 
              className='w-100 mb-2'
              variant={switchVariant}
              onClick={() => {
                setAddSwitch(!addSwitch);
                if(addSwitch) {
                  setSwitchButtonValue('Add Network Switch');
                  setSwitchVariant('primary');
                  setSelectedSwitch({
                    company: 'TP-Link',
                    speed: '',
                    noPorts: 0,
                  });
                } else {
                  setSwitchButtonValue('Remove Network Switch');
                  setSwitchVariant('danger');
                }
              }} >
                {switchButtonValue}
            </Button>
            {
              addSwitch &&
              <>
                <Form.Group>
                  <Form.Label>Select Switch Company</Form.Label>
                  <Form.Control
                    as='select'
                    value={selectedSwitch.company}
                    onChange={(e) => {
                      let swi = selectedSwitch;
                      swi.company = e.target.value;
                      setSelectedSwitch({...swi});
                    }}
                    required >
                      {
                        switchs.name.map((company, index) => {
                          return(
                            <option key={index} value={company}>{company}</option>
                          )
                        })
                      }
                  </Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Enter Speed</Form.Label>
                  <Form.Control 
                    type='text' 
                    value={selectedSwitch.speed}
                    onChange={(e) => {
                      let swi = selectedSwitch;
                      swi.speed = e.target.value;
                      setSelectedSwitch({...swi});
                    }}
                    placeholder='in Mbps'
                    required />
                </Form.Group>
                <>
                <Row className='mt-2 mb-2'>
                  <Col xs='4'>
                    <Form.Label>Number of Ports: </Form.Label>
                  </Col>
                  <Col xs='2'>
                    <Button 
                      className='w-50'
                      onClick={() => {
                        setSelectedSwitch((oldData) => ({
                          ...oldData,
                          noPorts: oldData.noPorts+1,
                        }))
                      }} >+</Button>
                  </Col>
                  <Col xs='4'>
                    <Form.Control 
                      type='text' 
                      value={Math.abs(selectedSwitch.noPorts)}
                      onChange={(e) => {
                        setSelectedSwitch((oldData) => ({
                          ...oldData,
                          noPorts: Math.abs(parseInt(e.target.value)),
                        }))
                      }}
                      required />
                  </Col>
                  <Col xs='2'>
                    <Button 
                      className='w-50'
                      onClick={() => {
                        selectedSwitch.noPorts > 0 &&
                        setSelectedSwitch((oldData) => ({
                          ...oldData,
                          noPorts: oldData.noPorts-1,
                        }))
                      }} >-</Button>
                  </Col>
                </Row>
                </>
              </>
            }
            <h5 className='mt-2 mb-1'>Network Router</h5><hr />
            <Button 
              className='w-100 mb-2'
              variant={routerVariant}
              onClick={() => {
                setAddRouter(!addRouter);
                if(addRouter) {
                  setRouterButtonValue('Add Router');
                  setRouterVariant('primary');
                  setSelectedRouter({
                    company: 'TP-Link',
                    band: '2',
                    noLAN: 0,
                    noWAN: 0,
                  });
                } else {
                  setRouterButtonValue('Remove Router');
                  setRouterVariant('danger');
                }
              }} >
                {routerButtonValue}
            </Button>
            {
              addRouter &&
              <>
                <Form.Group>
                  <Form.Label>Select Router Company</Form.Label>
                  <Form.Control
                    as='select'
                    value={selectedRouter.company}
                    onChange={(e) => {
                      let rout = selectedRouter;
                      rout.company = e.target.value;
                      setSelectedRouter({...rout});
                    }}
                    required >
                      {
                        routers.name.map((company, index) => {
                          return(
                            <option key={index} value={company}>{company}</option>
                          )
                        })
                      }
                  </Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Select Frequency band</Form.Label>
                  <Form.Control
                  as='select'
                  value={selectedRouter.band}
                  onChange={(e) => {
                    let rout = selectedRouter;
                    rout.band = e.target.value;
                    setSelectedRouter({...rout});
                  }}
                  required >
                    <option value='2'>2 GHz</option>
                    <option value='5'>5 GHz</option>
                    <option value='dual'>Dual Band</option>
                </Form.Control>
                </Form.Group>
                <>
                <Row className='mt-2 mb-2'>
                  <Col xs='4'>
                    <Form.Label>Number of LAN Ports: </Form.Label>
                  </Col>
                  <Col xs='2'>
                    <Button 
                      className='w-50'
                      onClick={() => {
                        setSelectedRouter((oldData) => ({
                          ...oldData,
                          noLAN: oldData.noLAN+1,
                        }))
                      }} >+</Button>
                  </Col>
                  <Col xs='4'>
                    <Form.Control 
                      type='text' 
                      value={Math.abs(selectedRouter.noLAN)}
                      onChange={(e) => {
                        setSelectedRouter((oldData) => ({
                          ...oldData,
                          noLAN: Math.abs(parseInt(e.target.value)),
                        }))
                      }}
                      required />
                  </Col>
                  <Col xs='2'>
                    <Button 
                      className='w-50'
                      onClick={() => {
                        selectedRouter.noLAN > 0 &&
                        setSelectedRouter((oldData) => ({
                          ...oldData,
                          noLAN: oldData.noLAN-1,
                        }))
                      }} >-</Button>
                  </Col>
                </Row>
                </>
                <>
                <Row className='mt-2 mb-2'>
                  <Col xs='4'>
                    <Form.Label>Number of WAN Ports: </Form.Label>
                  </Col>
                  <Col xs='2'>
                    <Button 
                      className='w-50'
                      onClick={() => {
                        setSelectedRouter((oldData) => ({
                          ...oldData,
                          noWAN: oldData.noWAN+1,
                        }))
                      }} >+</Button>
                  </Col>
                  <Col xs='4'>
                    <Form.Control 
                      type='text' 
                      value={Math.abs(selectedRouter.noWAN)}
                      onChange={(e) => {
                        setSelectedRouter((oldData) => ({
                          ...oldData,
                          noWAN: Math.abs(parseInt(e.target.value)),
                        }))
                      }}
                      required />
                  </Col>
                  <Col xs='2'>
                    <Button 
                      className='w-50'
                      onClick={() => {
                        selectedRouter.noWAN > 0 &&
                        setSelectedRouter((oldData) => ({
                          ...oldData,
                          noWAN: oldData.noWAN-1,
                        }))
                      }} >-</Button>
                  </Col>
                </Row>
                </>
              </>
            }

            <h4 className='text-center mt-4 mb-1'>Others</h4><hr />
            <Row className='mb-2'>
              <Col xs='4'>
                <Form.Label>Number of Lights: </Form.Label>
              </Col>
              <Col xs='2'>
                <Button className='w-50' onClick={() => setLights(lights+1)}>+</Button>
              </Col>
              <Col xs='4'>
                <Form.Control 
                  type='text'
                  className=''
                  value={Math.abs(lights)}
                  onChange={(e) => setLights(Math.abs(parseInt(e.target.value)))} />
              </Col>
              <Col xs='2'>
                <Button className='w-50' onClick={() => {lights > 0 && setLights(lights-1)}}>-</Button>
              </Col>
            </Row>
            <Row className='mb-2'>
              <Col xs='4'>
                <Form.Label>Number of Fans: </Form.Label>
              </Col>
              <Col xs='2'>
                <Button className='w-50' onClick={() => setFans(fans+1)}>+</Button>
              </Col>
              <Col xs='4'>
                <Form.Control 
                  type='text' 
                  className=''
                  value={Math.abs(fans)}
                  onChange={(e) => setFans(Math.abs(parseInt(e.target.value)))} />
              </Col>
              <Col xs='2'>
                <Button className='w-50' onClick={() => {fans > 0 && setFans(fans-1)}}>-</Button>
              </Col>
            </Row>
            <Row className='mb-2'>
              <Col xs='4'>
                <Form.Label>Number of Cupboards: </Form.Label>
              </Col>
              <Col xs='2'>
                <Button className='w-50' onClick={() => setCupboards(cupboards+1)}>+</Button>
              </Col>
              <Col xs='4'>
                <Form.Control 
                  type='text' 
                  className=''
                  value={Math.abs(cupboards)}
                  onChange={(e) => setCupboards(Math.abs(parseInt(e.target.value)))} />
              </Col>
              <Col xs='2'>
                <Button className='w-50' onClick={() => {cupboards > 0 && setCupboards(cupboards-1)}}>-</Button>
              </Col>
            </Row>
            <Row className='mb-2'>
              <Col xs='4'>
                <Form.Label>Number of Tables and Chairs: </Form.Label>
              </Col>
              <Col xs='2'>
                <Button className='w-50' onClick={() => setTableAndChairs(tableAndChair+1)}>+</Button>
              </Col>
              <Col xs='4'>
                <Form.Control 
                  type='text' 
                  className=''
                  value={Math.abs(tableAndChair)}
                  onChange={(e) => setTableAndChairs(Math.abs(parseInt(e.target.value)))} />
              </Col>
              <Col xs='2'>
                <Button className='w-50' onClick={() => {tableAndChair > 0 && setTableAndChairs(tableAndChair-1)}}>-</Button>
              </Col>
            </Row>

            <Button disabled={loading} className='w-100 mt-4' type='submit'>
              Create
            </Button>
            </Form>
          </Card.Body>
        </Card>
      }
    </div>
  );
}