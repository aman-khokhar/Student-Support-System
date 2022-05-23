import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Form, Row, Col, Accordion, Spinner } from 'react-bootstrap';
import { firestore } from '../firebase';
import { collection, doc, onSnapshot, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ManageLab({ match }) {
  const { currentUser } = useAuth();
  const role = currentUser.role;
  const history = useHistory();
  const labid = match.params.labid;
  const [lab, setLab] = useState({});
  const [labIncharges, setLabIncharges] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [processors, setProcessors] = useState({});
  const [graphicsCard, setGraphicsCard] = useState({});
  const [ups, setUps] = useState({});
  const [pcCompany, setPcCompany] = useState({});
  const [projectors, setProjectors] = useState({});
  const [printers, setPrinters] = useState({});
  const [routers, setRouters] = useState({});
  const [switchs, setSwitchs] = useState({});
  const [labs, setLabs] = useState([]);
  const [laptopMoveData, setLaptopMoveData] = useState([]);
  const [moveLoading, setMoveLoading] = useState(false);

  useEffect(() => {
    const unsubLab = onSnapshot(collection(firestore, 'labs'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === labid) {
          setLab(doc.data());
        }
      });
    });
    const unsubLabIncharge = onSnapshot(collection(firestore, 'users'), (snapshot) => {
      setLabIncharges(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})).filter(doc => doc.role==='lab-incharge'));
    });
    const unsubpc = onSnapshot(collection(firestore, 'vendors'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'pc') {
          setPcCompany(doc.data());
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
    const unsubLabs = onSnapshot(collection(firestore, 'labs'),(snapshot) => {
      setLabs(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
    });
    const unsubSwitch = onSnapshot(collection(firestore, 'vendors'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'switch') {
          setSwitchs(doc.data());
          setLoadingPage(false);
        }
        return null;
      });
    });

    return (unsubLab, unsubLabIncharge, unsubProcessors, unsubGraphicsCard, unsubups, unsubpc, unsubProjector, unsubPrinter, unsubRouter, unsubSwitch, unsubLabs);
  }, []);
  
  async function handleSubmit(e) {
    setError('');
    setSuccess('');
    e.preventDefault();

    try {
      setLoading(true);
      const docRefPast = doc(firestore, 'labs', labid);
      const snapshotPast = await getDoc(docRefPast);
      const dataPast = snapshotPast.data();
      let inchargeOld = labIncharges.filter(incharge => incharge.name === dataPast.labIncharge)[0];
      if(inchargeOld.name !== lab.incharge) {
        delete inchargeOld.labId;
        const inchargeRefOld = doc(firestore, 'users', inchargeOld.id);
        delete inchargeOld.id;
        await setDoc(inchargeRefOld, inchargeOld);
      }
      const payload = {...lab};
      const docRef = doc(firestore, 'labs', labid);
      await setDoc(docRef, payload);
      let selectedLabIncharge = labIncharges.filter(incharge => incharge.name === lab.labIncharge)[0];
      if(inchargeOld.name !== selectedLabIncharge.name) {
        const docRefNew = doc(firestore, 'users', selectedLabIncharge.id);
        delete selectedLabIncharge.id;
        await updateDoc(docRefNew, {
          labId: labid
        })
      }
      setSuccess('Changes Commited Successfully.');
    } catch(error) {
      setLoading(false);
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMoveLaptop(index) {
    setMoveLoading(true);
    if(!laptopMoveData[index]) {
      setMoveLoading(false);
      return;
    }
    let laptop = lab.laptops[index];
    let selectedLab = {};
    labs
    .filter(labobj => labobj.id === laptopMoveData[index])
    .map(labobj => {
      selectedLab = {...labobj};
    })
    let laptopArray = [];
    if(selectedLab.laptops) {
      laptopArray = [
        ...selectedLab.laptops,
        laptop,
      ];
    } else {
      laptopArray = [
        laptop,
      ];
    }
    selectedLab = {
      ...selectedLab,
      laptops: laptopArray,
    };
    try {
      const movedDocRef = doc(firestore, 'labs', selectedLab.id);
      const movingDocRef = doc(firestore, 'labs', labid);
      delete selectedLab.id;
      let snapshot = await getDoc(doc(firestore, 'labs', labid));
      let currentLab = snapshot.data();
      let array = [...currentLab.laptops];
      if(array.length > 0) {
        array.splice(index, 1);
        if(array.length === 0) {
          let item = {...lab};
          delete item.laptops;
          currentLab = {...item};
        } else {
          currentLab = {
            ...currentLab,
            laptops: array,
          }
        }
      }
      await setDoc(movedDocRef, selectedLab);
      await setDoc(movingDocRef, currentLab);
      handleRemoveLaptop(index);
    } catch(error) {
      setError(error.message);
    } finally {
      setMoveLoading(false);
    }
    
  }
  function handleLab(e, property) {
    let item = {...lab};
    item[property] = e.target.value;
    setLab(item);
  }

  function handleAddAC() {
    const acNumber = prompt('Enter Air Conditioner number.');
    if(!acNumber) {
      return null;
    }
    let array = [...lab.acs];
    for(let i=0; i<acNumber; i++) {
      array.push({
        company: '',
        capacity: '1'
      });
    }
    setLab(oldData => ({
      ...oldData,
      acs: array
    }));
  }

  function handleACProperties(e, index, property) {
    let items = [...lab.acs];
    let item = {...items[index]};
    item[property] = e.target.value;
    items[index] = item;
    setLab(oldData => ({
        ...oldData,
        acs: items
      }));
  }

  function handleDeleteAc() {
    setError('');
    const acNumber = prompt('Enter Air Conditioner number.');    
    const acindex = lab.noAc - acNumber;
    let array = [...lab.acs];
    if(array.length >= acNumber) {
      array.splice(acindex, acNumber);
      setLab(oldData => ({
        ...oldData,
        acs: array
      }));
    } else {
      setError('Cannot Delete Air Conditioners more than available number.');
    }
  }

  function handlePCProperties(e, index, property) {
    let items = [...lab.pcs];
    let item = {...items[index]};
    item[property] = e.target.value;
    items[index] = item;
    setLab(oldData => ({
      ...oldData,
      pcs: items
    }));
  }
  function handleRemove(index) {
    let array = [...lab.pcs];
    if(array.length > 1) {
      array.splice(index, 1)
      setLab(oldData => ({
        ...oldData,
        pcs: array,
        noPcs: parseInt(oldData.noPcs) - 1,
      }));
    }
  }

  function handleProjectorProperties(e, property) {
    let proj = lab.projector;
    proj[property] = e.target.value;
    setLab(oldData => ({
      ...oldData,
      projector: proj
    }));
  }

  function handleUsb(e, operation) {
    if(operation === 'none') {
      let proj = lab.projector;
      proj.noUSB = Math.abs(parseInt(e.target.value));
      setLab(oldData => ({
        ...oldData,
        projector: proj
      }));
    } else {
      if(operation === '+') {
        let proj = lab.projector;
        proj.noUSB = parseInt(proj.noUSB) + 1;
        setLab(oldData => ({
          ...oldData,
          projector: proj
        }));
      } else if(operation === '-') {
        let proj = lab.projector;
        if(proj.noUSB > 0) {
          proj.noUSB = parseInt(proj.noUSB) - 1;
          setLab(oldData => ({
            ...oldData,
            projector: proj
          }));
        }
      }
    }
  }
  function handlePorts(e, operation) {
    if(operation === 'none') {
      let swi = lab.switch;
      swi.noPorts = Math.abs(parseInt(e.target.value));
      setLab(oldData => ({
        ...oldData,
        switch: swi
      }));
    } else {
      if(operation === '+') {
        let swi = lab.switch;
        swi.noPorts = parseInt(swi.noPorts) + 1;
        setLab(oldData => ({
          ...oldData,
          switch: swi
        }));
      } else if(operation === '-') {
        let swi = lab.switch;
        if(swi.noPorts > 0) {
          swi.noPorts = parseInt(swi.noPorts) - 1;
          setLab(oldData => ({
            ...oldData,
            switch: swi
          }));
        }
      }
    }
  }
  function handleRouterProperties(e, property, operation) {
    if(operation === 'none') {
      let rout = lab.router;
      rout[property] = Math.abs(parseInt(e.target.value));
      setLab(oldData => ({
        ...oldData,
        router: rout
      }));
    } else {
      if(operation === '+') {
        let rout = lab.router;
        rout[property] = parseInt(rout[property]) + 1;
        setLab(oldData => ({
          ...oldData,
          router: rout
        }));
      } else if(operation === '-') {
        let rout = lab.router;
        if(rout[property] > 0) {
          rout[property] = parseInt(rout[property]) - 1;
          setLab(oldData => ({
            ...oldData,
            router: rout
          }));
        }
      }
    }
  }
  function handleOtherProperties(e, property, operation) {
    if(operation === 'none') {
      let item = lab[property];
      item = Math.abs(parseInt(e.target.value));
      setLab(oldData => ({
        ...oldData,
        [property]: item
      }));
    } else {
      if(operation === '+') {
        let item = lab[property];
        item = parseInt(item) + 1;
        setLab(oldData => ({
          ...oldData,
          [property]: item
        }));
      } else if(operation === '-') {
        let item = lab[property];
        if(item > 0) {
          item = parseInt(item) - 1;
          setLab(oldData => ({
            ...oldData,
            [property]: item
          }));
        }
      }
    }
  }

  function handleAddPC() {
    let array = [...lab.pcs];
    array.push({
      name: `PC ${array.length+1}`,
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
    setLab(oldData => ({
      ...oldData,
      pcs: array,
      noPcs: parseInt(oldData.noPcs) + 1,
    }));
  }
  function handleRemoveProperty(property) {
    let newLab = {...lab};
    delete newLab[property]
    setLab(newLab);
  }
  function handleAddProjector() {
    setLab(oldData => ({
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
  function handleAddSwitch() {
    setLab(oldData => ({
      ...oldData,
      switch: {
        company: 'TP-Link',
        speed: '',
        noPorts: 0,
      }
    }));
  }
  function handleAddRouter() {
    setLab(oldData => ({
      ...oldData,
      router: {
        company: 'TP-Link',
        band: '2',
        noLAN: 0,
        noWAN: 0,
      }
    }));
  }
  function handleAddPrinter() {
    setLab(oldData => ({
      ...oldData,
      printerCompany: 'Ricoh',
    }));
  }
  function handleLaptopProperties(e, property) {
    let item = {...lab.laptop};
    item[property] = e.target.value;
    setLab(oldData => ({
      ...oldData,
      laptop: item,
    }));
  }
  function handleLaptopProperties(e, index, property) {
    let items = [...lab.laptops];
    let item = {...items[index]};
    item[property] = e.target.value;
    items[index] = item;
    setLab(oldData => ({
      ...oldData,
      laptops: items
    }));
  }
  function handleRemoveLaptop(index) {
    let array = [...lab.laptops];
    if(array.length > 0) {
      array.splice(index, 1);
      if(array.length === 0) {
        let item = {...lab};
        delete item.laptops;
        setLab(item);
        return;
      }
      setLab(oldData => ({
        ...oldData,
        laptops: array,
      }));
    }
  }

  return(
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
                <Form.Group id='lab-name'>
                  <Form.Label>Lab Name</Form.Label>
                  <Form.Control 
                    type='text' 
                    defaultValue={lab.name}
                    onChange={(e) => handleLab(e, 'name')}
                    required />
                </Form.Group>
                <Form.Group id='lab-incharge'>
                  <Form.Label>Lab incharge</Form.Label>
                  <Form.Select
                    value={lab.labIncharge}
                    onChange={(e) => handleLab(e, 'labIncharge')}
                    required
                  >
                    <option value={lab.labIncharge}>{lab.labIncharge}</option>
                    {labIncharges
                    .filter(incharge => !incharge.labId)
                    .map((labIncharge, index) => {
                      return(
                        <option 
                          key={index} 
                          value={labIncharge.name} >
                            {labIncharge.name}
                        </option>
                      )
                    })}
                  </Form.Select>
                </Form.Group>

                <h4 className='text-center mt-4 mb-1'>Air Conditioner</h4><hr />
                <Button className='w-100 mt-2' onClick={handleAddAC}>Add Air Conditioner</Button>
                {
                  lab.noAc > 0 &&
                  <>
                    {lab.acs.map((ac, index) => {
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

                <h4 className='text-center mt-4 mb-1'>PC</h4>
                <h5 className='mt-4 mb-1'>PC Configuration</h5><hr />
                <Accordion>
                  <Accordion.Item eventKey='0'>
                    <Accordion.Header>PC</Accordion.Header>
                    <Accordion.Body>
                      <Accordion>
                      {
                        lab.pcs.map((pc, index) => {
                          return(
                            <div key={index}>
                              <Accordion.Item eventKey={index}>
                              <Accordion.Header>PC {index+1}</Accordion.Header>
                              <Accordion.Body>
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
                              </Accordion.Body>
                              </Accordion.Item>
                            </div>
                          );
                        })
                      }
                      </Accordion>
                      <Button className='w-100 mt-2' onClick={handleAddPC}>Add PC</Button>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>

                <h4 className='text-center mt-4 mb-1'>Peripherals</h4>
                <h5 className='mb-1'>Projector</h5><hr />
                {
                  lab.projector ? 
                  <>
                    <Form.Group>
                      <Form.Label>Select Projector Company</Form.Label>
                      <Form.Control
                        as='select'
                        value={lab.projector.company}
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
                      value={lab.projector.resolution}
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
                        defaultValue={lab.projector.brightness}
                        onChange={(e) => handleProjectorProperties(e, 'brightness')}
                        placeholder='in Lumens' 
                        required />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Select Input Port</Form.Label>
                      <Form.Control
                        as='select'
                        value={lab.projector.inputPort}
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
                          value={lab.projector.noUSB}
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
                <h5 className='mb-1'>Printer</h5><hr />
                {
                  lab.printerCompany ?
                  <>
                    <Form.Group>
                      <Form.Label>Select Printer Company</Form.Label>
                      <Form.Control
                        as='select'
                        value={lab.printerCompany}
                        onChange={(e) => setLab(oldData => ({
                          ...oldData,
                          printerCompany: e.target.value
                        }))}
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
                    <Button 
                      className='w-100 mt-2 mb-2' 
                      variant='danger' 
                      onClick={() => handleRemoveProperty('printerCompany')} >Remove Printer</Button>
                  </> : <>
                    <Button 
                      className='w-100 mt-2 mb-2'
                      onClick={handleAddPrinter} >Add Printer</Button>
                  </>
                }
                <h5 className='mt-2 mb-1'>Network Switch</h5><hr />
                {
                  lab.switch ?
                  <>
                  <Form.Group>
                    <Form.Label>Select Switch Company</Form.Label>
                    <Form.Control
                      as='select'
                      value={lab.switch.company}
                      onChange={(e) => {
                        let swi = lab.switch;
                        swi.company = e.target.value;
                        setLab(oldData => ({
                          ...oldData,
                          switch: swi,
                        }));
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
                      value={lab.switch.speed}
                      onChange={(e) => {
                        let swi = lab.switch;
                        swi.speed = e.target.value;
                        setLab(oldData => ({
                          ...oldData,
                          switch: swi,
                        }));
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
                        onClick={(e) => handlePorts(e, '+')} >+</Button>
                    </Col>
                    <Col xs='4'>
                      <Form.Control 
                        type='text' 
                        value={lab.switch.noPorts}
                        onChange={(e) => handlePorts(e, 'none')}
                        required />
                    </Col>
                    <Col xs='2'>
                      <Button 
                        className='w-50'
                        onClick={(e) => handlePorts(e, '-')} >-</Button>
                    </Col>
                  </Row>
                  </>
                  <Button 
                      className='w-100 mt-2 mb-2' 
                      variant='danger' 
                      onClick={() => handleRemoveProperty('switch')} >Remove Switch</Button>
                  </> : <>
                    <Button 
                      className='w-100 mt-2 mb-2'
                      onClick={handleAddSwitch} >Add Switch</Button>
                  </>
                }
                <h5 className='mt-2 mb-1'>Network Router</h5><hr />
                {
                  lab.router ?
                  <>
                    <Form.Group>
                      <Form.Label>Select Router Company</Form.Label>
                      <Form.Control
                        as='select'
                        value={lab.router.company}
                        onChange={(e) => {
                          let rout = lab.router;
                          rout.company = e.target.value;
                          setLab(oldData => ({
                            ...oldData,
                            router: rout,
                          }));
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
                      value={lab.router.band}
                      onChange={(e) => {
                        let rout = lab.router;
                        rout.band = e.target.value;
                        setLab(oldData => ({
                          ...oldData,
                          router: rout,
                        }));
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
                          onClick={(e) => handleRouterProperties(e, 'noLAN', '+')} >+</Button>
                      </Col>
                      <Col xs='4'>
                        <Form.Control 
                          type='text' 
                          value={lab.router.noLAN}
                          onChange={(e) => handleRouterProperties(e, 'noLAN', 'none')}
                          required />
                      </Col>
                      <Col xs='2'>
                        <Button 
                          className='w-50'
                          onClick={(e) => handleRouterProperties(e, 'noLAN', '-')} >-</Button>
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
                          onClick={(e) => handleRouterProperties(e, 'noWAN', '+')} >+</Button>
                      </Col>
                      <Col xs='4'>
                        <Form.Control 
                          type='text' 
                          value={lab.router.noWAN}
                          onChange={(e) => handleRouterProperties(e, 'noWAN', 'none')}
                          required />
                      </Col>
                      <Col xs='2'>
                        <Button 
                          className='w-50'
                          onClick={(e) => handleRouterProperties(e, 'noWAN', '-')} >-</Button>
                      </Col>
                    </Row>
                    <Button 
                      className='w-100 mt-2 mb-2' 
                      variant='danger' 
                      onClick={() => handleRemoveProperty('router')} >Remove Router</Button>
                    </>
                  </> : <>
                    <Button 
                      className='w-100 mt-2 mb-2'
                      onClick={handleAddRouter} >Add Router</Button>
                  </>
                }
                
                <h4 className='text-center mt-4 mb-1'>Others</h4><hr />
                <Row className='mb-2'>
                  <Col xs='4'>
                    <Form.Label>Number of Lights: </Form.Label>
                  </Col>
                  <Col xs='2'>
                    <Button 
                      className='w-50' 
                      onClick={(e) => handleOtherProperties(e, 'noLight', '+')} >+</Button>
                  </Col>
                  <Col xs='4'>
                    <Form.Control 
                      type='text'
                      value={lab.noLight}
                      onChange={(e) => handleOtherProperties(e, 'noLight', 'none')} />
                  </Col>
                  <Col xs='2'>
                    <Button 
                      className='w-50' 
                      onClick={(e) => handleOtherProperties(e, 'noLight', '-')} >-</Button>
                  </Col>
                </Row>
                <Row className='mb-2'>
                  <Col xs='4'>
                    <Form.Label>Number of Fans: </Form.Label>
                  </Col>
                  <Col xs='2'>
                    <Button 
                      className='w-50'
                      onClick={(e) => handleOtherProperties(e, 'noFan', '+')} >+</Button>
                  </Col>
                  <Col xs='4'>
                    <Form.Control 
                      type='text' 
                      value={lab.noFan}
                      onChange={(e) => handleOtherProperties(e, 'noFan', 'none')} />
                  </Col>
                  <Col xs='2'>
                    <Button 
                      className='w-50'
                      onClick={(e) => handleOtherProperties(e, 'noFan', '-')} >-</Button>
                  </Col>
                </Row>
                <Row className='mb-2'>
                  <Col xs='4'>
                    <Form.Label>Number of Cupboards: </Form.Label>
                  </Col>
                  <Col xs='2'>
                    <Button 
                      className='w-50'
                      onClick={(e) => handleOtherProperties(e, 'noCupboard', '+')} >+</Button>
                  </Col>
                  <Col xs='4'>
                    <Form.Control 
                      type='text'
                      value={lab.noCupboard}
                      onChange={(e) => handleOtherProperties(e, 'noCupboard', 'none')} />
                  </Col>
                  <Col xs='2'>
                    <Button 
                      className='w-50'
                      onClick={(e) => handleOtherProperties(e, 'noCupboard', '-')} >-</Button>
                  </Col>
                </Row>
                <Row className='mb-2'>
                  <Col xs='4'>
                    <Form.Label>Number of Tables and Chairs: </Form.Label>
                  </Col>
                  <Col xs='2'>
                    <Button 
                      className='w-50'
                      onClick={(e) => handleOtherProperties(e, 'noTableChair', '+')} >+</Button>
                  </Col>
                  <Col xs='4'>
                    <Form.Control 
                      type='text'
                      value={lab.noTableChair}
                      onChange={(e) => handleOtherProperties(e, 'noTableChair', 'none')} />
                  </Col>
                  <Col xs='2'>
                    <Button 
                      className='w-50'
                      onClick={(e) => handleOtherProperties(e, 'noTableChair', '-')} >-</Button>
                  </Col>
                </Row>

                {
                  lab.laptops && 
                  <>
                    <h4 className='text-center mt-4 mb-1'>Laptop</h4><hr />
                    <Accordion>
                      <Accordion.Item eventKey='0'>
                        <Accordion.Header>Laptop</Accordion.Header>
                        <Accordion.Body>
                          <Accordion>
                          {
                            lab.laptops.map((pc, index) => {
                              return(
                                <div key={index}>
                                  <Accordion.Item eventKey={index}>
                                  <Accordion.Header>Laptop {index+1}</Accordion.Header>
                                  <Accordion.Body>
                                  <h5 className='mt-2'>Laptop {index+1}</h5>
                                  <Form.Group id={`pcVendor${index}`}>
                                    <Form.Label>Select PC vendor</Form.Label>
                                    <Form.Control
                                      as='select'
                                      value={pc.laptopVendor}
                                      onChange={(e) => handleLaptopProperties(e, index, 'pcVendor')}
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
                                          onChange={(e) => handleLaptopProperties(e, index, 'processorBrand')}
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
                                          onChange={(e) => handleLaptopProperties(e, index, 'processorVersion')}
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
                                      onChange={(e) => handleLaptopProperties(e, index, 'os')}
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
                                      onChange={(e) => handleLaptopProperties(e, index, 'graphics')}
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
                                            onChange={(e) => handleLaptopProperties(e, index, 'graphicsBrand')}
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
                                            onChange={(e) => handleLaptopProperties(e, index, 'graphicsVersion')}
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
                                            onChange={(e) => handleLaptopProperties(e, index, 'graphicsMemory')}
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
                                      onChange={(e) => handleLaptopProperties(e, index, 'ram')}
                                    />
                                  </Form.Group>
                                  <Form.Group id={`storage${index}`}>
                                    <Form.Label>Storage</Form.Label>
                                    <Form.Control 
                                      type='text' 
                                      value={pc.storage} 
                                      placeholder='in GB' 
                                      required 
                                      onChange={(e) => handleLaptopProperties(e, index, 'storage')}
                                    />
                                  </Form.Group>
                                  <Row className='text-center align-items-center mt-2'>
                                    <Col xs='2'>
                                      <Form.Label>Move to</Form.Label></Col>
                                    <Col xs='1'>
                                      <h1>&rarr;</h1>
                                    </Col>
                                    <Col xs='7'>
                                      <Form.Select
                                        onChange={(e) => {
                                          let items = [...laptopMoveData];
                                          items[index] = e.target.value;
                                          setLaptopMoveData(items);
                                        }}
                                      >
                                          <option value=''>--SELECT LAB IF YOU WANT TO MOVE--</option>
                                          {
                                            labs
                                            .sort((a, b) => a.name > b.name ? 1 : -1)
                                            .filter(labobj => labobj.name !== lab.name)
                                            .map((lab, index) => {
                                              return(
                                                <option key={index} value={lab.id}>{lab.name}</option>
                                              );
                                            })
                                          }
                                      </Form.Select>
                                    </Col>
                                    <Col xs='1'>
                                      <Button 
                                        disabled={moveLoading}
                                        className='wt-100'
                                        onClick={() => handleMoveLaptop(index)} >Move</Button>
                                    </Col>
                                  </Row>
                                  <Button 
                                    id={`btn${index}`} 
                                    className='w-100 mt-2'
                                    variant='danger'
                                    onClick={() => handleRemoveLaptop(index)}
                                  >
                                    Remove
                                  </Button>
                                  </Accordion.Body>
                                  </Accordion.Item>
                                </div>
                              );
                            })
                          }
                          </Accordion>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
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