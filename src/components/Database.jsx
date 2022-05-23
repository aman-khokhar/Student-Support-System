import React, { useState, useEffect } from 'react'
import { Card, Spinner, Button, Nav, Accordion, Form, Row, Col, Alert } from 'react-bootstrap';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { onSnapshot, collection, doc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import CircularRemove from './CircularRemove.tsx';

export default function Database() {
  const { currentUser } = useAuth();
  const role = currentUser.role;
  const history = useHistory();
  const [loadingPage, setLoadingPage] = useState(true);
  const [problems, setProblems] = useState({});
  const [vendors, setVendors] = useState([]);
  const [selectedNav, setSelectedNav] = useState('problems');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubProblems = onSnapshot(collection(firestore, 'problems'), (snapshot) => {
      let itemObject = {};
      snapshot.docs.map(doc => {
        itemObject = {
          ...itemObject,
          [doc.id]: doc.data()
        }
      });
      setProblems(itemObject);
    });
    const unsubVendors = onSnapshot(collection(firestore, 'vendors'), (snapshot) => {
      let itemObject = {};
      snapshot.docs.map(doc => {
        itemObject = {
          ...itemObject,
          [doc.id]: doc.data()
        }
      });
      setVendors(itemObject);
      setLoadingPage(false);
    });
    return (unsubProblems, unsubVendors);
  }, []);

  async function handleUpdateProblem(e, problem) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    let isVaild=true;
    try {
      Object.keys(problems[problem]).map(key => {
        if(problems[problem][key] === '') {
          isVaild = false;
          return;
        }
      })
      if(isVaild) {
        const docRef = doc(firestore, 'problems', problem);
        await setDoc(docRef, problems[problem]);
        setSuccess('Updated Successfully');
        setLoading(false);
      } else {
        setError('Please fill all Values.');
        setLoading(false);
      }
    } catch(error) {
      setError(error.message);
      setLoading(false);
    }
  }

  async function handleUpdateVendor(e, vendor) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    let isVaild=true;
    try {
      Object.keys(vendors[vendor]).map(key => {
        vendors[vendor][key].map(device => {
          if(device === '') {
            isVaild = false;
            return;
          }
        });
      })
      if(isVaild) {
        const docRef = doc(firestore, 'vendors', vendor);
        await setDoc(docRef, vendors[vendor]);
        setSuccess('Updated Successfully');
        setLoading(false);
      } else {
        setError('Please fill all Values.');
        setLoading(false);
      }
    } catch(error) {
      setError(error.message);
      setLoading(false);
    }
  }


  return (
    <>
      {role !== 'resource-manager' && history.push('/')}
      {
        loadingPage &&
        <>
          <div className='text-center'>
            <Spinner animation='border' /><big><strong><p>Loading</p></strong></big>
          </div>
        </>
      }
      {
        (!loadingPage && role === 'resource-manager') &&
        <>
          <Card className='w-50' style={{ margin: 'auto', padding: '10px' }}>
            <Card.Header>
              <Nav
                className='justify-content-center'
                variant='tabs' 
                defaultActiveKey='problems'
                onSelect={selectKey => setSelectedNav(selectKey)} >
                <Nav.Item>
                  <Nav.Link eventKey='problems'>Problems</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='vendors'>Vendors</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              <h2 className='text-center mb-4'>Database</h2>
              {
                selectedNav === 'problems' &&
                <Accordion>
                {
                  Object.keys(problems).map((problem, indexMain) => {
                    return(
                      <Accordion.Item key={indexMain} eventKey={indexMain}>
                        <Accordion.Header>{problem}</Accordion.Header>
                        <Accordion.Body>
                          {error && <Alert variant='danger'>{error}</Alert>}
                          {success && <Alert variant='success'>{success}</Alert>}
                          <Row>
                            <Col xs='4'>
                              <Form.Label>Field</Form.Label>
                            </Col>
                            <Col xs='8'>
                              <Form.Label>Value</Form.Label>
                            </Col>
                          </Row>
                          <Form id={problem} onSubmit={handleUpdateProblem}>
                          <Row>
                            <Col xs='4'>
                            {
                              Object.keys(problems[problem])
                              .filter(key => key!== 'id')
                              .map((key) => {
                                return(
                                  <Form.Control
                                    className='mt-1'
                                    key={key}
                                    type='input'
                                    defaultValue={key}
                                    disabled={true}
                                    required />
                                );
                              })
                            }
                            </Col>
                            <Col xs='8'>
                            {
                              Object.keys(problems[problem])
                              .filter(key => key!== 'id')
                              .map((key) => {
                                return(
                                  <Form.Group key={key}>
                                  <Row>
                                    <Col xs='9'>
                                      <Form.Control
                                        className='mt-1'
                                        type='input'
                                        value={problems[problem][key]}
                                        onChange={(e) => {
                                          let item = {...problems}
                                          item[problem][key] = e.target.value;
                                          setProblems(item);
                                        }}
                                        required />
                                    </Col>
                                    <Col xs='3' className='mt-2'>
                                      <CircularRemove 
                                        style={{ cursor: 'pointer'}} 
                                        height={25} 
                                        width={25} 
                                        onClick={() => {
                                          let item = {...problems}
                                          delete item[problem][key];
                                          setProblems(item);
                                        }} />
                                    </Col>
                                  </Row>
                                  </Form.Group>
                                );
                              })
                            }
                            </Col>
                          </Row>
                          <Button 
                            className='w-100 mt-2' 
                            onClick={() => {
                              const key = prompt('Enter Field');
                              if(key) {
                                let item = {...problems};
                                item[problem] = {
                                  ...item[problem],
                                  [key]: key,
                                }
                                setProblems({...item});
                              }  
                            }}>
                            Add Field
                          </Button>
                          <Button 
                            className='w-100 mt-2' 
                            variant='success'
                            type='submit'
                            disabled={loading}
                            onClick={(e) => handleUpdateProblem(e, problem)} >Update</Button>
                          </Form>
                        </Accordion.Body>
                      </Accordion.Item>
                    );
                  })
                }
                </Accordion>
              }
              {
                selectedNav === 'vendors' &&
                <Accordion>
                {
                  Object.keys(vendors).map((vendor, index) => {
                    return(
                      <Accordion.Item key={index} eventKey={index}>
                        <Accordion.Header>{vendor}</Accordion.Header>
                        <Accordion.Body>
                          {error && <Alert variant='danger'>{error}</Alert>}
                          {success && <Alert variant='success'>{success}</Alert>}
                          <Form onSubmit={handleUpdateVendor}>
                          {
                            Object.keys(vendors[vendor]).map(key => {
                              return(
                                <div key={key}>
                                  <Row>
                                    <Col>{key}</Col>
                                  </Row>
                                  {
                                    vendors[vendor][key].map((device, index) => {
                                      // if(index%2 === 1) { return}
                                      return(
                                        <div key={index}>
                                          <Row>
                                            <Col xs={4} className='mt-1'>
                                              <Form.Control
                                                type='input'
                                                value={vendors[vendor][key][index]}
                                                onChange={(e) => {
                                                  let item = {...vendors};
                                                  item[vendor][key][index] = e.target.value;
                                                  setVendors(item);
                                                }}
                                                required />
                                            </Col>
                                            <Col xs={2} className='mt-1'>
                                              <CircularRemove 
                                                className='mt-2'
                                                style={{ cursor: 'pointer'}} 
                                                height={25} 
                                                width={25}
                                                onClick={() => {
                                                  let item = {...vendors};
                                                  item[vendor][key].splice(index, 1);
                                                  setVendors(item);
                                                }} />
                                            </Col>
                                          </Row>
                                        </div>
                                      );
                                    })
                                  }
                                  <Button 
                                    className='w-100 mt-2'
                                    onClick={() => {
                                      let item = {...vendors};
                                      item[vendor][key].push('');
                                      setVendors(item);
                                    }} >
                                    Add Field
                                  </Button>
                                </div>
                              );
                            })
                          }
                          <Button 
                            className='w-100 mt-2' 
                            variant='success'
                            type='submit'
                            disabled={loading}
                            onClick={(e) => handleUpdateVendor(e, vendor)} >
                            Update
                          </Button>
                          </Form>
                        </Accordion.Body>
                      </Accordion.Item>
                    );
                  })
                }
                </Accordion>
              }
            </Card.Body>
          </Card>
        </>
      }
    </>
  )
}
