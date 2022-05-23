import { Redirect } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function NotFound() {
  const { currentUser } = useAuth();

  return currentUser ? <Redirect to='/home' /> : <Redirect to='/' />;
}
