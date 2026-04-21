import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AppNavbar() {
  const { currentUser, signOutUser } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <Navbar expand="lg" className="app-navbar shadow-sm">
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="brand-name">
          Product Feedback Board
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar-nav" />

        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="ms-auto align-items-lg-center gap-lg-2">
            <Nav.Link as={NavLink} to="/">
              Home
            </Nav.Link>

            <Nav.Link as={NavLink} to="/create">
              Create Project
            </Nav.Link>

            {currentUser ? (
              <div className="d-flex align-items-center gap-2 ms-lg-2 mt-3 mt-lg-0">
                <span className="small text-secondary">{currentUser.email}</span>
                <Button variant="outline-success" size="sm" onClick={handleSignOut}>
                  Log Out
                </Button>
              </div>
            ) : (
              <Button as={NavLink} to="/auth" variant="success" size="sm" className="ms-lg-2 mt-3 mt-lg-0">
                Sign Up / Log In
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
