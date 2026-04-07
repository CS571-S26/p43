import { Col, Container, Row } from 'react-bootstrap'
import ProductCard from '../components/ProductCard'
import ProductForm from '../components/ProductForm'

function ProjectsPage({ projects, onAddProject }) {
  return (
    <div className="page-section">
      <Container>
        <div className="section-header mb-4">
          <div>
            <h1 className="page-title mb-2">Projects</h1>
            <p className="text-muted mb-0">
              Browse available product boards or create a new one with a simple starter form.
            </p>
          </div>
        </div>

        <Row className="g-4 mb-5">
          <Col lg={7}>
            <Row className="g-4">
              {projects.map((project) => (
                <Col md={6} key={project.id}>
                  <ProductCard project={project} />
                </Col>
              ))}
            </Row>
          </Col>

          <Col lg={5}>
            <ProductForm onAddProject={onAddProject} />
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default ProjectsPage
