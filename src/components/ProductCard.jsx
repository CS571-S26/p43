import { Badge, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function ProductCard({ project }) {
  return (
    <Card className="project-card h-100 shadow-sm border-0">
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-3 gap-3">
          <div>
            <Card.Title className="mb-1">{project.name}</Card.Title>
            <Badge bg="success-subtle" text="success" pill>
              {project.category}
            </Badge>
          </div>
          <div className="ticket-count">{project.tickets.length} ideas</div>
        </div>

        <Card.Text className="text-muted mb-3">{project.summary}</Card.Text>
        <p className="small text-secondary mb-4">Owned by {project.owner}</p>

        <Button
          as={Link}
          to={`/board/${project.id}`}
          variant="success"
          className="mt-auto board-button"
        >
          Open Board
        </Button>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;