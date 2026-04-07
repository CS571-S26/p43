import { useState } from 'react'
import { Badge, Button, ButtonGroup, Card } from 'react-bootstrap'

function BoardPreview({ project }) {
  const [activeView, setActiveView] = useState('proposed')

  const proposedIdeas = project.tickets ?? []
  const implementedIdeas = project.implementedIdeas ?? []

  const showingProposed = activeView === 'proposed'
  const visibleIdeas = showingProposed ? proposedIdeas : implementedIdeas

  return (
    <div>
      <div className="board-page-header d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <Badge bg="success-subtle" text="success" pill className="mb-2">
            {project.category}
          </Badge>
          <h2 className="page-title mb-2">{project.name} Feedback Board</h2>
          <p className="text-muted mb-1">{project.summary}</p>
          <p className="small text-secondary mb-0">Managed by {project.owner}</p>
        </div>

        <Button className="new-idea-button board-page-action" variant="success" disabled>
          + New Idea
        </Button>
      </div>

      <Card className="board-shell border-0 shadow-sm">
        <Card.Body>
          <div className="board-section-header d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
            <div>
              <h3 className="section-title mb-1">
                {showingProposed ? 'Proposed ideas' : 'Already implemented'}
              </h3>
              <p className="text-muted mb-0">
                {showingProposed
                  ? 'These are feature requests and improvements users want next.'
                  : 'These ideas have already been added to the product.'}
              </p>
            </div>

            <ButtonGroup>
              <Button
                variant={showingProposed ? 'success' : 'outline-success'}
                onClick={() => setActiveView('proposed')}
              >
                Proposed Ideas
              </Button>
              <Button
                variant={!showingProposed ? 'success' : 'outline-success'}
                onClick={() => setActiveView('implemented')}
              >
                Already Implemented
              </Button>
            </ButtonGroup>
          </div>

          <div className="idea-list">
            {visibleIdeas.length > 0 ? (
              visibleIdeas.map((ticket) => (
                <Card className="ticket-card mb-3" key={ticket.id}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <h4 className="ticket-title mb-1">{ticket.title}</h4>
                        <p className="text-muted mb-0">{ticket.description}</p>
                      </div>

                      {showingProposed ? (
                        <div className="vote-pill">
                          <span className="vote-number">{ticket.votes}</span>
                          <span className="vote-text">votes</span>
                        </div>
                      ) : (
                        <div className="status-pill">Implemented</div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <div className="empty-state">
                {showingProposed
                  ? 'No proposed ideas have been listed for this project yet.'
                  : 'No implemented ideas have been listed for this project yet.'}
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default BoardPreview