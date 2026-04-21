import { useState } from 'react';
import { Alert, Badge, Button, ButtonGroup, Card, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const emptyIdeaForm = {
  title: '',
  description: '',
};

function BoardPreview({
  project,
  tickets,
  currentUser,
  userVotesByTicket,
  onAddTicket,
  onVote,
}) {
  const [activeView, setActiveView] = useState('proposed');
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [ideaForm, setIdeaForm] = useState(emptyIdeaForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const proposedIdeas = [...(tickets ?? [])].sort((a, b) => b.votes - a.votes);
  const implementedIdeas = project.implementedIdeas ?? [];

  const showingProposed = activeView === 'proposed';
  const visibleIdeas = showingProposed ? proposedIdeas : implementedIdeas;

  const handleIdeaChange = (event) => {
    const { name, value } = event.target;
    setIdeaForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleIdeaSubmit = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await onAddTicket(project.id, ideaForm);
      setIdeaForm(emptyIdeaForm);
      setShowIdeaForm(false);
      setActiveView('proposed');
    } catch (error) {
      console.error('Unable to add idea:', error);
      setErrorMessage('We could not submit your idea right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoteClick = async (ticketId, voteType) => {
    if (!currentUser) {
      return;
    }

    const currentVote = userVotesByTicket[ticketId] ?? 0;

    try {
      await onVote(project.id, ticketId, currentVote, voteType);
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

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

        <Button
          className="new-idea-button board-page-action"
          variant="success"
          disabled={!currentUser}
          onClick={() => setShowIdeaForm((prev) => !prev)}
        >
          {showIdeaForm ? 'Cancel' : '+ New Idea'}
        </Button>
      </div>

      {!currentUser ? (
        <Alert variant="light" className="border shadow-sm">
          <strong>Want to participate?</strong> Sign in to submit ideas and vote on existing tickets.
          <div className="mt-3">
            <Button as={Link} to="/auth" variant="success" size="sm">
              Sign Up / Log In
            </Button>
          </div>
        </Alert>
      ) : null}

      {showIdeaForm && currentUser ? (
        <Card className="form-card border-0 shadow-sm mb-4">
          <Card.Body>
            <h3 className="section-title mb-3">Submit a New Idea</h3>

            <Form onSubmit={handleIdeaSubmit}>
              <Form.Group className="mb-3" controlId="ideaTitle">
                <Form.Label>Idea title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  placeholder="Ex: Dark mode scheduling view"
                  value={ideaForm.title}
                  onChange={handleIdeaChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="ideaDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  placeholder="Describe the feature request..."
                  value={ideaForm.description}
                  onChange={handleIdeaChange}
                  required
                />
              </Form.Group>

              {errorMessage ? (
                <p className="text-danger small mb-3">{errorMessage}</p>
              ) : null}

              <div className="d-flex justify-content-end">
                <Button type="submit" variant="success" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Idea'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      ) : null}

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
              visibleIdeas.map((ticket) => {
                const currentUserVote = userVotesByTicket[ticket.id] ?? 0;

                return (
                  <Card className="ticket-card mb-3" key={ticket.id}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div className="flex-grow-1">
                          <h4 className="ticket-title mb-1">{ticket.title}</h4>
                          <p className="text-muted mb-0">{ticket.description}</p>
                        </div>

                        {showingProposed ? (
                          <div className="vote-actions d-flex align-items-center gap-3">
                            <div className="vote-pill">
                              <span className="vote-number">{ticket.votes}</span>
                              <span className="vote-text">votes</span>
                            </div>

                            <div className="vote-button-column d-flex flex-column gap-2">
                              <Button
                                variant={currentUserVote === 1 ? 'success' : 'outline-success'}
                                disabled={!currentUser}
                                onClick={() => handleVoteClick(ticket.id, 'up')}
                              >
                                Upvote
                              </Button>

                              <Button
                                variant={currentUserVote === -1 ? 'danger' : 'outline-danger'}
                                disabled={!currentUser}
                                onClick={() => handleVoteClick(ticket.id, 'down')}
                              >
                                Downvote
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="status-pill">Implemented</div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                );
              })
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
  );
}

export default BoardPreview;
