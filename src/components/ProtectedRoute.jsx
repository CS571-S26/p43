import { Spinner } from 'react-bootstrap';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';

function ProtectedRoute({ children }) {
  const { currentUser, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
