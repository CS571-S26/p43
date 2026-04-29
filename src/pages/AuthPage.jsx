import { useState } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';

const emptyForm = {
  email: '',
  password: '',
};

function AuthPage() {
  const [mode, setMode] = useState('signup');
  const [formData, setFormData] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = location.state?.from || '/';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        await signUp(formData.email, formData.password);
      } else {
        await signIn(formData.email, formData.password);
      }

      setFormData(emptyForm);
      navigate(destination, { replace: true });
    } catch (error) {
      console.error('Authentication failed:', error);

      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('That email already has an account. Try logging in instead.');
      } else if (error.code === 'auth/invalid-credential') {
        setErrorMessage('The email or password is incorrect.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Use a stronger password with at least 6 characters.');
      } else {
        setErrorMessage('We could not complete authentication right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-section">
      <div className="mx-auto" style={{ maxWidth: '520px' }}>
        <Card className="form-card border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex gap-2 mb-4">
              <Button
                variant={mode === 'signup' ? 'success' : 'outline-success'}
                onClick={() => {
                  setMode('signup');
                  setErrorMessage('');
                }}
              >
                Sign Up
              </Button>
              <Button
                variant={mode === 'login' ? 'success' : 'outline-success'}
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
              >
                Log In
              </Button>
            </div>

            <h2 className="section-title mb-2">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-muted mb-4">
              {mode === 'signup'
                ? 'Create an account so your votes and new ideas are tied to a real user.'
                : 'Log in to continue voting and contributing to shared project boards.'}
            </p>

            {errorMessage ? (
              <Alert variant="danger" className="border-0">
                {errorMessage}
              </Alert>
            ) : null}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="authEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="authPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
              </Form.Group>

              <Button type="submit" variant="success" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Submitting...'
                  : mode === 'signup'
                    ? 'Create Account'
                    : 'Log In'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </section>
  );
}

export default AuthPage;
