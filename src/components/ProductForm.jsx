import { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PROJECT_CATEGORIES } from '../constants/categories';

const emptyForm = {
  name: '',
  category: '',
  owner: '',
  summary: '',
};

const normalizeProjectData = (project = {}) => ({
  name: project.name ?? '',
  category: project.category ?? '',
  owner: project.owner ?? '',
  summary: project.summary ?? '',
});

function ProductForm({
  onAddProject,
  onSubmitProject,
  initialData = emptyForm,
  title = 'Create a new project',
  description = 'Start a shared feedback board with a product name, category, and short description.',
  submitLabel = 'Add Project',
  submittingLabel = 'Creating...',
  errorMessageText = 'We could not save the project right now. Please try again.',
  navigateOnSuccess = true,
  onSuccess,
  onCancel,
}) {
  const submitProject = onSubmitProject ?? onAddProject;
  const [formData, setFormData] = useState(() => normalizeProjectData(initialData));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setFormData(normalizeProjectData(initialData));
    setErrorMessage('');
    setValidated(false);
    setIsSubmitting(false);
  }, [initialData]);

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
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    setIsSubmitting(true);

    try {
      const result = await submitProject(formData);
      setValidated(false);
      setErrorMessage('');

      if (navigateOnSuccess && typeof result === 'string') {
        setFormData(emptyForm);
        navigate(`/board/${result}`);
      } else {
        setFormData(normalizeProjectData(formData));
      }

      onSuccess?.(result);
    } catch (error) {
      console.error('Unable to save project:', error);
      setErrorMessage(errorMessageText);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="form-card border-0 shadow-sm">
      <Card.Body>
        <div className="mb-3">
          <h3 className="section-title mb-1">{title}</h3>
          <p className="text-muted mb-0">{description}</p>
        </div>

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="projectName">
                <Form.Label>Project name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Ex: Campus Planner"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a project name.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="projectCategory">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a category</option>
                  {PROJECT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text muted>
                  Categories make it easier for people to browse related projects.
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  Please choose a category before creating the project.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="projectOwner">
                <Form.Label>Owner / team</Form.Label>
                <Form.Control
                  type="text"
                  name="owner"
                  placeholder="Ex: Student Dev Team"
                  value={formData.owner}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please add the owner or team name.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="projectSummary">
                <Form.Label>Short summary</Form.Label>
                <Form.Control
                  type="text"
                  name="summary"
                  placeholder="Describe the product in one sentence"
                  value={formData.summary}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please add a short summary for the project.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {errorMessage ? (
            <p className="text-danger small mt-3 mb-0">{errorMessage}</p>
          ) : null}

          <div className="d-flex justify-content-end gap-2 mt-4">
            {onCancel ? (
              <Button
                type="button"
                variant="outline-secondary"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            ) : null}
            <Button type="submit" variant="success" disabled={isSubmitting}>
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ProductForm;
