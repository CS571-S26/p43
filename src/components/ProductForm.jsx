import { useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const emptyForm = {
  name: '',
  category: '',
  owner: '',
  summary: '',
};

function ProductForm({ onAddProject }) {
  const [formData, setFormData] = useState(emptyForm);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newProjectId = onAddProject(formData);
    setFormData(emptyForm);
    navigate(`/board/${newProjectId}`);
  };

  return (
    <Card className="form-card border-0 shadow-sm">
      <Card.Body>
        <div className="mb-3">
          <h3 className="section-title mb-1">Create a new project</h3>
          <p className="text-muted mb-0">
            Start a new feedback board with a product name, category, and short description.
          </p>
        </div>

        <Form onSubmit={handleSubmit}>
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
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="projectCategory">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type="text"
                  name="category"
                  placeholder="Ex: Productivity"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
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
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-4">
            <Button type="submit" variant="success">
              Add Project
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ProductForm;