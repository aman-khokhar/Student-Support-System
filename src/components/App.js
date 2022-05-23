import { Switch, Route } from 'react-router-dom';
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import Login from "./Login";
import PrivateRoute from "./PrivateRoute";
import Labs from "./Labs";
import CreateLab from './CreateLab';
import ManageLab from './ManageLab';
import CreateTicket from './CreateTicket';
import TicketsStudent from "./TicketsStudent";
import NotFound from "./NotFound";
import SingleTicket from './SingleTicket';
import TicketsHod from './TicketsHod';
import CreateClassroom from './CreateClassroom';
import AddLaptop from "./AddLaptop";
import ManageClassroom from "./ManageClassroom";
import Classrooms from "./Classrooms";
import TicketsLab from "./TicketsLab";
import Database from "./Database";
import Department from "./Department";
import TicketsHodClassroom from "./TicketsHodClassroom";
import CreateMultipleUsers from "./CreateMultipleUsers";
import AboutUs from "./AboutUs";
import ContactUs from "./ContactUs";

function App() {
  return (
    <div className="App">
      <Switch>
        <PrivateRoute path='/home' component={Dashboard} />
        <PrivateRoute path='/labs' component={Labs} />
        <PrivateRoute path='/manage-lab/:labid' component={ManageLab} />
        <PrivateRoute path='/create-lab' component={CreateLab} />
        <PrivateRoute path='/create-classroom' component={CreateClassroom} />
        <PrivateRoute path='/manage-classroom/:classroomid' component={ManageClassroom} />
        <PrivateRoute path='/classrooms' component={Classrooms} />
        <PrivateRoute path='/create-ticket' component={CreateTicket} />
        <PrivateRoute exact path='/tickets' component={TicketsStudent} />
        <PrivateRoute path='/ticket/:ticketid' component={SingleTicket} />
        <PrivateRoute path='/tickets/hod/lab' component={TicketsHod} />
        <PrivateRoute path='/tickets/hod/classroom' component={TicketsHodClassroom} />
        <PrivateRoute path='/add-laptop' component={AddLaptop} />
        <PrivateRoute exact path='/create-user/single' component={Signup} />
        <PrivateRoute exact path='/create-user/multiple' component={CreateMultipleUsers} />
        <PrivateRoute path='/tickets/lab' component={TicketsLab} />
        <PrivateRoute path='/database' component={Database} />
        <Route path='/aboutus' component={AboutUs} />
        <Route path='/contactus' component={ContactUs} />
        <Route path='/login' component={Login} />
        <Route exact path='/' component={Department} />
        <Route path='*' component={NotFound} />
      </Switch>
    </div>
  );
}

export default App;
