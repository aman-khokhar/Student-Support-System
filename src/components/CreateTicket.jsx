import React, { useEffect, useState, useRef } from 'react';
import { Card, Alert, Button, Form, Spinner, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { firestore } from '../firebase';
import { onSnapshot, collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export default function CreateTicket() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const [labs, setLabs] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedLab, setSelectedLab] = useState();
  const [selectedClassroom, setSelectedClassroom] = useState();
  const [loadingPage, setLoadingPage] = useState(true);
  const [acProblems, setAcProblems] = useState({});
  const [benchProblems, setBenchProblems] = useState({});
  const [boardProblems, setBoardProblems] = useState({});
  const [fanProblems, setFanProblems] = useState({});
  const [lightProblems, setLightProblems] = useState({});
  const [pcProblems, setPcProblems] = useState({});
  const [printerProblems, setPrinterProblems] = useState({});
  const [projectorProblems, setProjectorProblems] = useState({});
  const [switchBoardProblems, setSwitchBoardProblems] = useState({});
  const [tableChairProblems, setTableChairProblems] = useState({});
  const history = useHistory();

  const formLabRef = useRef();
  const [formRoomValue, setFormRoom] = useState('lab');
  const [formResourceValue, setFormResource] = useState('pc');
  const [formProblemValue, setFormProblem] = useState('');
  const [formPcNumberValue, setFormPcNumber] = useState(1);
  const [formOtherDescriptionValue, setFormOther] = useState('');
  const formClassroomRef = useRef();
  const [addDescription, setAddDescription] = useState('+ Add ');

  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, 'labs'), (snapshot) => {
      setLabs(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
    });
    const unsubclassroom = onSnapshot(collection(firestore, 'classrooms'), (snapshot) => {
      setClassrooms(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
    });
    const unsubac = onSnapshot(collection(firestore, 'problems'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'ac') {
          setAcProblems(doc.data());
        }
        return null;
      });
    });
    const unsubbench = onSnapshot(collection(firestore, 'problems'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'bench') {
          setBenchProblems(doc.data());
        }
        return null;
      });
    });
    const unsubboard = onSnapshot(collection(firestore, 'problems'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'board') {
          setBoardProblems(doc.data());
        }
        return null;
      });
    });
    const unsubfan = onSnapshot(collection(firestore, 'problems'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'fan') {
          setFanProblems(doc.data());
        }
        return null;
      });
    });
    const unsublight = onSnapshot(collection(firestore, 'problems'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'light') {
          setLightProblems(doc.data());
        }
        return null;
      });
    });
    const unsubpc = onSnapshot(collection(firestore, 'problems'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'pc') {
          setPcProblems(doc.data());
        }
        return null;
      });
    });
    const unsubprinter = onSnapshot(collection(firestore, 'problems'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'printer') {
          setPrinterProblems(doc.data());
        }
        return null;
      });
    });
    const unsubprojector = onSnapshot(collection(firestore, 'problems'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'projector') {
          setProjectorProblems(doc.data());
        }
        return null;
      });
    });
    const unsubswitchboard = onSnapshot(collection(firestore, 'problems'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'switchboard') {
          setSwitchBoardProblems(doc.data());
        }
        return null;
      });
    });
    const unsubtablechair = onSnapshot(collection(firestore, 'problems'), (snapshot) => {
      snapshot.docs.map(doc => {
        if(doc.id === 'tableChair') {
          setTableChairProblems(doc.data());
          setLoadingPage(false);
        }
        return null;
      });
    });
    return (unsub, unsubclassroom, unsubac, unsubbench, unsubboard, unsubfan, unsublight, unsubpc, unsubprinter, unsubprojector, unsubswitchboard, unsubtablechair);
  }, []);

  useEffect(() => {
    setFormProblem(Object.keys(pcProblems)[0]);
  }, []);

  function handleSelectLab(e) {
    setSelectedLab({...labs[e.target.value]});
    setFormPcNumber(1);
    setFormResource('pc');
    setFormProblem('wontStart');
  }
  function handleSelectClassroom(e) {
    setSelectedClassroom({...classrooms[e.target.value]});
    setFormResource('pc');
    setFormProblem('wontStart');
  }

  function handleResource(e) {
    setFormResource(e.target.value);
    if(e.target.value === 'switchBoard') {
      setFormProblem(Object.keys(switchBoardProblems)[0]);
      return;
    } else if(e.target.value === 'tableChair') {
      setFormProblem(Object.keys(tableChairProblems)[0]);
      return;
    } else if(e.target.value === 'board') {
      setFormProblem(Object.keys(boardProblems)[0]);
      return;
    } else if(e.target.value === 'bench') {
      setFormProblem(Object.keys(benchProblems)[0]);
      return;
    } else if(e.target.value === 'ac') {
      setFormProblem(Object.keys(acProblems)[0]);
      return;
    } else if(e.target.value === 'pc') {
      setFormProblem(Object.keys(pcProblems)[0]);
      return;
    } else if(e.target.value === 'light') {
      setFormProblem(Object.keys(lightProblems)[0]);
      return;
    } else if(e.target.value === 'fan') {
      setFormProblem(Object.keys(fanProblems)[0]);
      return;
    } else if(e.target.value === 'printer') {
      setFormProblem(Object.keys(printerProblems)[0]);
      return;
    } else if(e.target.value === 'projector') {
      setFormProblem(Object.keys(projectorProblems)[0]);
      return;
    } 
  }

  async function ticketChecker() {
    let flag = 0;
    if(formRoomValue === 'lab') {
      const q = query(collection(firestore, 'tickets'), where('labName', '==', selectedLab.name));
      const snapshot = await getDocs(q);
      snapshot.forEach(doc => {
        const item = doc.data();
        if(item.status !== 'resolved') {
          if((formResourceValue === 'pc') && (item.problemWith === 'pc')) {
            if(item.pcNumber === formPcNumberValue) {
              flag = 1;
            }
          } else if(formResourceValue === item.problemWith) {
            flag = 2;
          }
        }
      });
    } else if(formRoomValue === 'classroom') {
      const q = query(collection(firestore, 'tickets'), where('className', '==', selectedClassroom.name));
      const snapshot = await getDocs(q);
      snapshot.forEach(doc => {
        const item = doc.data();
        console.log(item.status);
        if(item.status !== 'resolved')
        {
          if((formResourceValue === 'pc') && (item.problemWith === 'pc')) {
            if(item.pcNumber === formPcNumberValue) {
              flag = 1;
            }
          } else if(formResourceValue === item.problemWith) {
              flag = 2;
          }
        }
      });
    }
    if(flag === 1) {
      return new Promise((resolve, reject) => {
        resolve('Can`t create a ticket of same PC when one already exist.');
      });
    } else if(flag === 2) {
      return new Promise((resolve, reject) => {
        resolve('Can`t create a ticket of same component when one already exist.');
      });
    }
    return new Promise((resolve, reject) => {
      resolve(false);
    });
  }

  async function handleSubmit(e) {
    try {
      setError('');
      e.preventDefault();
      setLoading(true);
      const validString = await ticketChecker();
      if(validString) {
        setError(validString);
        setLoading(false);
        return;
      }
      const today = new Date();
      const month = today.toLocaleString('default', { month: 'short' });
      const day = today.toLocaleString('default', { weekday: 'short' });
      const date = day + ', ' + today.getDate() + ' ' + month + ', ' + today.getFullYear() + ' at ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
      let temp = {};
      if(formRoomValue === 'lab') {
        temp = {
          labName: selectedLab.name,
          labId: selectedLab.id,
        }
      } else if(formRoomValue === 'classroom') {
        temp = {
          className: selectedClassroom.name,
          classId: selectedClassroom.id,
        }
      }
      let newDescription = '';
      if(formProblemValue !== 'other') {
        if(addDescription === '+ Add ') {
          newDescription = 'None';
        } else {
          newDescription = formOtherDescriptionValue;
        }
      } else {
        newDescription = formOtherDescriptionValue;
      }
      let ticket = {
        name: currentUser.name,
        uid: currentUser.uid,
        ...temp,
        problemWith: formResourceValue,
        pcNumber: formPcNumberValue,
        problem: formProblemValue,
        description: newDescription,
        createdAt: date,
        status: 'pending',
      };
      const collectionRef = collection(firestore, 'tickets');
      const payload = {...ticket};
      await addDoc(collectionRef, payload);
      history.push('/home');
    } catch(error) {
      setError(error);
      setLoading(false);
    }
  }

  return(
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
        <Card className='w-50' style={{ margin: 'auto', padding: '10px' }}>
        <Card.Body>
          {error && <Alert variant='danger'>{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Where problem occured in lab or in classroom?</Form.Label>
              <Form.Control
                as='select'
                value={formRoomValue}
                onChange={(e) => setFormRoom(e.target.value)}
                required
              >
                <option value='lab'>Lab</option>
                <option value='classroom'>Classroom</option>
              </Form.Control>
            </Form.Group>
            {
              formRoomValue === 'lab' &&
              <>
                <Form.Group id='lab-number'>
                  <Form.Label>
                    Which Lab has Problems&nbsp;
                    <OverlayTrigger
                      placement='right'
                      overlay={
                        <Tooltip>Lab number should be on top of lab door.</Tooltip>
                      } >
                      <Badge bg='secondary'>?</Badge>
                    </OverlayTrigger>
                  </Form.Label>
                  <Form.Control
                    as="select"
                    ref={formLabRef}
                    onChange={handleSelectLab}
                    required
                  >
                    {
                      !selectedLab &&
                      <option value=''>--SELECT LAB--</option>
                    }
                    {labs.sort((a, b) => a.name > b.name ? 1 : -1)
                    .map((lab,index) => {
                      return(
                        <option key={index} value={index}>{lab.name}</option>
                      )
                    })}
                  </Form.Control>
                </Form.Group>
                {
                  selectedLab &&
                  <>
                    <Form.Group id='resource-value'>
                      <Form.Label>
                        Which of the following has problems&nbsp;
                        <OverlayTrigger
                          placement='right'
                          overlay={
                            <Tooltip>Select which device has problem.</Tooltip>
                          } >
                          <Badge bg='secondary'>?</Badge>
                        </OverlayTrigger>
                      </Form.Label>
                      <Form.Control
                        as="select"
                        value={formResourceValue}
                        onChange={handleResource}
                        required
                      >
                        <option value='pc'>PC</option>
                        <option value='ac'>Air Conditioner</option>
                        <option value='light'>Light</option>
                        <option value='fan'>Fan</option>
                        <option value='switchBoard'>Switch board</option>
                        <option value='projector'>Projector</option>
                        <option value='printer'>Printer</option>
                        <option value='tableChair'>Table & Chair</option>
                      </Form.Control>
                    </Form.Group>
                    {
                      (formResourceValue === 'pc' || formResourceValue === 'switchBoard') &&
                      <>
                        <Form.Group id='number-pc'>
                          <Form.Label>
                            Which PC number has problems&nbsp;
                            <OverlayTrigger
                              placement='right'
                              overlay={
                                <Tooltip>PC number should be written behind your moniter.</Tooltip>
                              } >
                              <Badge bg='secondary'>?</Badge>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Control
                            as='select'
                            value={formPcNumberValue}
                            onChange={(e) => setFormPcNumber(parseInt(e.target.value))}
                            required
                           >
                            {
                              selectedLab.pcs.map((pc, index) => {
                                return(
                                  <option key={index} value={parseInt(index) + 1}>{pc.name}</option>
                                )
                              })
                            }
                          </Form.Control>
                      </Form.Group>
                      </>
                    }
                    <Form.Group>
                      <Form.Label>What is the problem?</Form.Label>
                      <Form.Control
                        as="select"
                        value={formProblemValue}
                        onChange={(e) => setFormProblem(e.target.value)}
                        required
                      >
                        {
                          formResourceValue === 'pc' &&
                          <>
                            {Object.keys(pcProblems).map((key, index) => {
                              return(
                                <option key={index} value={key}>{pcProblems[key]}</option>
                              )
                            })}
                            <option value='other'>Other</option>
                          </> 
                        }
                        {
                          formResourceValue === 'ac' &&
                          <>
                            {Object.keys(acProblems).map((key, index) => {
                              return(
                                <option key={index} value={key}>{acProblems[key]}</option>
                              )
                            })}
                            <option value='other'>Other</option>
                          </>
                        }
                        {
                          formResourceValue === 'light' &&
                          <>
                            {Object.keys(lightProblems).map((key, index) => {
                              return(
                                <option key={index} value={key}>{lightProblems[key]}</option>
                              )
                            })}
                            <option value='other'>Other</option>
                          </>
                        }
                        {
                          formResourceValue === 'fan' &&
                          <>
                            {Object.keys(fanProblems).map((key, index) => {
                              return(
                                <option key={index} value={key}>{fanProblems[key]}</option>
                              )
                            })}
                            <option value='other'>Other</option>
                          </>
                        }
                        {
                          formResourceValue === 'switchBoard' &&
                          <>
                            {Object.keys(switchBoardProblems).map((key, index) => {
                              return(
                                <option key={index} value={key}>{switchBoardProblems[key]}</option>
                              )
                            })}
                            <option value='other'>Other</option>
                          </>
                        }
                        {
                          formResourceValue === 'tableChair' &&
                          <>
                            {Object.keys(tableChairProblems).map((key, index) => {
                              return(
                                <option key={index} value={key}>{tableChairProblems[key]}</option>
                              )
                            })}
                            <option value='other'>Other</option>
                          </>
                        }
                        {
                          formResourceValue === 'printer' &&
                          <>
                            {Object.keys(printerProblems).map((key, index) => {
                              return(
                                <option key={index} value={key}>{printerProblems[key]}</option>
                              )
                            })}
                            <option value='other'>Other</option>
                          </>
                        }
                        {
                          formResourceValue === 'projector' &&
                          <>
                            {Object.keys(projectorProblems).map((key, index) => {
                              return(
                                <option key={index} value={key}>{projectorProblems[key]}</option>
                              )
                            })}
                            <option value='other'>Other</option>
                          </>
                        }
                      </Form.Control>
                      {
                        formProblemValue !== 'other' &&
                        <Form.Text muted>
                          We Recommend you to add description so its easier for us to identify problems.
                        </Form.Text>
                      }
                    </Form.Group>
                    {
                      formProblemValue !== 'other' &&
                      <Button 
                        className='w-15 mt-2'
                        onClick={() => {
                          if(addDescription === '+ Add ') {
                            setAddDescription('- Remove ');
                          } else if(addDescription === '- Remove ') {
                            setAddDescription('+ Add ');
                          }
                        }} >
                          {addDescription} Description
                      </Button>
                    }
                    {
                      (formProblemValue === 'other' || addDescription === '- Remove ') &&
                      <>
                        <Form.Group>
                          <Form.Label>Express your Problem</Form.Label>
                          <Form.Control
                            as='textarea'
                            value={formOtherDescriptionValue}
                            rows='2'
                            placeholder='Description'
                            required
                            onChange={(e) => setFormOther(e.target.value)}/>
                        </Form.Group>
                      </>
                    }
                  </>
                }
              </>
              
            }
            {
              formRoomValue === 'classroom' &&
              <>
                <Form.Group>
                  <Form.Label>
                    Which Classroom has Problems&nbsp;
                    <OverlayTrigger
                      placement='right'
                      overlay={
                        <Tooltip>Classroom number should be on top of room door.</Tooltip>
                      } >
                      <Badge bg='secondary'>?</Badge>
                    </OverlayTrigger>
                  </Form.Label>
                  <Form.Control
                    as="select"
                    ref={formClassroomRef}
                    onChange={handleSelectClassroom}
                    required
                  >
                    {
                      !selectedClassroom &&
                      <option value=''>--SELECT CLASSROOM--</option>
                    }
                    {classrooms.sort((a, b) => a.name > b.name ? 1 : -1)
                    .map((classroom,index) => {
                      return(
                        <option key={index} value={index}>{classroom.name}</option>
                      )
                    })}
                  </Form.Control>
                </Form.Group>
                {
                  selectedClassroom &&
                  <>
                    <Form.Group id='resource-value'>
                      <Form.Label>
                        Which of the following has problems&nbsp;
                        <OverlayTrigger
                          placement='right'
                          overlay={
                            <Tooltip>Select which device has problem.</Tooltip>
                          } >
                          <Badge bg='secondary'>?</Badge>
                        </OverlayTrigger>
                      </Form.Label>
                      <Form.Control
                        as="select"
                        value={formResourceValue}
                        onChange={handleResource}
                        required
                      >
                        <option value='pc'>PC</option>
                        <option value='ac'>Air Conditioner</option>
                        <option value='projector'>Projector</option>
                        <option value='board'>Board</option>
                        <option value='bench'>Bench</option>
                      </Form.Control>
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>What is the problem?</Form.Label>
                      <Form.Control
                        as="select"
                        value={formProblemValue}
                        onChange={(e) => setFormProblem(e.target.value)}
                        required
                      >
                        {
                          formResourceValue === 'pc' &&
                          <>
                            {Object.keys(pcProblems).map((key, index) => {
                              return(
                                <option key={index} value={key}>{pcProblems[key]}</option>
                              )
                            })}
                            <option value='other'>Other</option>
                          </> 
                        }
                        {
                          formResourceValue === 'ac' &&
                          <>
                            {Object.keys(acProblems).map((key, index) => {
                              return(
                                <option key={index} value={key}>{acProblems[key]}</option>
                              )
                            })}
                            <option value='other'>Other</option>
                          </>
                        }
                        {
                          formResourceValue === 'projector' &&
                          <>
                            {Object.keys(projectorProblems).map((key, index) => {
                              return(
                                <option key={index} value={key}>{projectorProblems[key]}</option>
                              )
                            })}
                            <option value='other'>Other</option>
                          </>
                        }
                        {
                          formResourceValue === 'board' &&
                          <>
                            {Object.keys(boardProblems).map((key, index) => {
                              return(
                                <option key={index} value={key}>{boardProblems[key]}</option>
                              )
                            })}
                            <option value='other'>Other</option>
                          </>
                        }
                        {
                          formResourceValue === 'bench' &&
                          <>
                            {Object.keys(benchProblems).map((key, index) => {
                              return(
                                <option key={index} value={key}>{benchProblems[key]}</option>
                              )
                            })}
                            <option value='other'>Other</option>
                          </>
                        }
                      </Form.Control>
                      {
                        formProblemValue !== 'other' &&
                        <Form.Text muted>
                          We Recommend you to add description so its easier for us to identify problems.
                        </Form.Text>
                      }
                    </Form.Group>
                    {
                      formProblemValue !== 'other' &&
                      <Button 
                        className='w-15 mt-2'
                        onClick={() => {
                          if(addDescription === '+ Add ') {
                            setAddDescription('- Remove ');
                          } else if(addDescription === '- Remove ') {
                            setAddDescription('+ Add ');
                          }
                        }} >
                          {addDescription} Description
                      </Button>
                    }
                    {
                      (formProblemValue === 'other' || addDescription === '- Remove ') &&
                      <>
                        <Form.Group>
                          <Form.Label>Express your Problem</Form.Label>
                          <Form.Control
                            as='textarea'
                            value={formOtherDescriptionValue}
                            rows='2'
                            required
                            placeholder='Description'
                            onChange={(e) => setFormOther(e.target.value)}/>
                        </Form.Group>
                      </>
                    }
                  </>
                }
              </>
            }
            
            <Button disabled={loading} className='w-100 mt-4' type='submit'>
              Create Ticket
            </Button>
          </Form>
        </Card.Body>
      </Card>
      }
    </div>
  );
}
