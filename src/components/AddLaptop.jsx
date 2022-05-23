import React, { useState, useEffect, useRef } from 'react'
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Spinner, Button, Alert, Form, Row, Col } from 'react-bootstrap';
import { onSnapshot, collection, doc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

export default function AddLaptop() {
  const history = useHistory();
  const { currentUser } = useAuth();
  const role = currentUser.role;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [loadingPage, setLoadingPage] = useState(true);

  const [labs, setLabs] = useState([]);
  const [pcCompany, setPcCompany] = useState({});
  const [processors, setProcessors] = useState({});
  const [graphicsCard, setGraphicsCard] = useState({});

  const [selectedLab, setSelectedLab] = useState({});
  const pcCompanyRef = useRef();
  const osRef = useRef();
  const [processorBrand, setProcessorBrand] = useState('amd');
  const processorVersionRef = useRef();
  const generationRef = useRef();
  const [graphics, setGraphics] = useState('integrated');
  const [graphicsBrand, setGraphicsBrand] = useState('amd');
  const graphicsVersionRef = useRef();
  const graphicsMemoryRef = useRef();
  const ramRef = useRef();
  const storageRef = useRef();


  useEffect(() => {
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
    const unsubLab = onSnapshot(collection(firestore, 'labs'),(snapshot) => {
      setLabs(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
      setLoadingPage(false);
    });

    return (unsubpc, unsubProcessors, unsubGraphicsCard, unsubLab);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    let laptop = {};
    let graphicsObj = {};
    const laptopVendor = pcCompanyRef.current.value;
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

    try {
      setLoading(true);
      laptop = {
        laptopVendor,
        os,
        processorBrand,
        processorGeneration,
        processorVersion,
        graphics,
        ...graphicsObj,
        ram,
        storage,
      }
      let lab = {...selectedLab};
      delete lab.id;
      let laptopArray = [];
      if(lab.laptops) {
        laptopArray = [
          ...lab.laptops,
          laptop,
        ];
      } else {
        laptopArray = [
          laptop,
        ];
      }
      lab = {
        ...lab,
        laptops: laptopArray,
      };
      const docRef = doc(firestore, 'labs', selectedLab.id);
      const payload = {...lab};
      await setDoc(docRef, payload);
      setSuccess('Laptop added successfully.');

    } catch(error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
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
                  <Form.Label>Select Lab in which you want to add laptop.</Form.Label>
                  <Form.Select
                    onChange={(e) => setSelectedLab({...labs[e.target.value]})}
                    required >
                      <option value=''>--SELECT LAB--</option>
                      {
                        labs
                        .sort((a, b) => a.name > b.name ? 1 : -1)
                        .map((lab, index) => {
                          return(
                            <option key={index} value={index}>{lab.name}</option>
                          );
                        })
                      }
                  </Form.Select>
                </Form.Group>

                <h4 className='text-center mt-4 mb-1'>Laptop</h4><hr />
                <Form.Group>
                  <Form.Label>Select Laptop vendor</Form.Label>
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

                <Button disabled={loading} className='w-100 mt-4' type='submit'>
                  Add Laptop
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </>
      }
    </>
  )
}
