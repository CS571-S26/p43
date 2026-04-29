import { useEffect, useState } from "react";
import {
  Accordion,
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Card,
  Form,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  IDEA_CATEGORIES,
  UNCATEGORIZED_LABEL,
} from "../constants/categories";
import ProductForm from "./ProductForm";

const emptyIdeaForm = {
  title: "",
  description: "",
  category: "",
};

const getCategoryLabel = (category) => category?.trim() || UNCATEGORIZED_LABEL;
const normalizeIdeaData = (idea = {}) => ({
  title: idea.title ?? "",
  description: idea.description ?? "",
  category: idea.category ?? "",
});

function IdeaFormPanel({
  title,
  description,
  initialData = emptyIdeaForm,
  onSubmitIdea,
  onSuccess,
  onCancel,
  submitLabel,
  submittingLabel,
  errorMessageText,
  idPrefix,
  withCard = true,
  className = "",
}) {
  const [formData, setFormData] = useState(() => normalizeIdeaData(initialData));
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setFormData(normalizeIdeaData(initialData));
    setValidated(false);
    setIsSubmitting(false);
    setErrorMessage("");
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
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    setIsSubmitting(true);

    try {
      await onSubmitIdea(formData);
      setValidated(false);
      setErrorMessage("");
      onSuccess?.();
    } catch (error) {
      console.error("Unable to save idea:", error);
      setErrorMessage(errorMessageText);
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <>
      {title || description ? (
        <div className="mb-3">
          {title ? <h3 className="section-title mb-1">{title}</h3> : null}
          {description ? <p className="text-muted mb-0">{description}</p> : null}
        </div>
      ) : null}

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId={`${idPrefix}Title`}>
          <Form.Label>Idea title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            placeholder="Ex: Dark mode scheduling view"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Please enter a short idea title.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId={`${idPrefix}Description`}>
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            placeholder="Describe the feature request..."
            value={formData.description}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Please describe the idea before submitting it.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId={`${idPrefix}Category`}>
          <Form.Label>Idea category</Form.Label>
          <Form.Select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Choose an idea category</option>
            {IDEA_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Form.Select>
          <Form.Text muted>
            Categories help teams organize feature requests, bugs, and other
            feedback.
          </Form.Text>
          <Form.Control.Feedback type="invalid">
            Please choose an idea category before submitting.
          </Form.Control.Feedback>
        </Form.Group>

        {errorMessage ? (
          <p className="text-danger small mb-3">{errorMessage}</p>
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
    </>
  );

  if (!withCard) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={`form-card border-0 shadow-sm ${className}`.trim()}>
      <Card.Body>{content}</Card.Body>
    </Card>
  );
}

function BoardPreview({
  project,
  tickets,
  currentUser,
  userVotesByTicket,
  ownerVoteRecords,
  ownerStatsLoading,
  onAddTicket,
  onEditProject,
  onEditTicket,
  onVote,
  onDeleteProject,
  onDeleteTicket,
  onMarkIdeaImplemented,
}) {
  const [activeView, setActiveView] = useState("proposed");
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [showProjectEditForm, setShowProjectEditForm] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState("");
  const navigate = useNavigate();
  const [actionErrorMessage, setActionErrorMessage] = useState("");
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [deletingTicketId, setDeletingTicketId] = useState("");
  const isProjectOwner = currentUser?.uid === project.createdByUid;
  const [movingTicketId, setMovingTicketId] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const projectCategoryLabel = getCategoryLabel(project.category);

  const proposedIdeas = [...(tickets ?? [])].sort(
    (a, b) => (b.votes ?? 0) - (a.votes ?? 0),
  );
  const implementedIdeas = project.implementedIdeas ?? [];
  const allIdeas = [...proposedIdeas, ...implementedIdeas];
  const implementedVoteTotals = implementedIdeas.reduce(
    (totals, idea) => ({
      upvotes: totals.upvotes + (idea.upvotes ?? 0),
      downvotes: totals.downvotes + (idea.downvotes ?? 0),
    }),
    { upvotes: 0, downvotes: 0 },
  );
  const activeVoteTotals = ownerVoteRecords.reduce(
    (totals, vote) => ({
      upvotes: totals.upvotes + (vote.value === 1 ? 1 : 0),
      downvotes: totals.downvotes + (vote.value === -1 ? 1 : 0),
    }),
    { upvotes: 0, downvotes: 0 },
  );
  const totalUpvotes = ownerStatsLoading
    ? null
    : activeVoteTotals.upvotes + implementedVoteTotals.upvotes;
  const totalDownvotes = ownerStatsLoading
    ? null
    : activeVoteTotals.downvotes + implementedVoteTotals.downvotes;
  const contributorCount = new Set(
    allIdeas
      .map((idea) => idea.createdByUid || idea.createdByEmail || "")
      .filter(Boolean),
  ).size;
  const categoryCount = new Set(
    allIdeas.map((idea) => getCategoryLabel(idea.category)),
  ).size;
  const ownerStatCards = [
    {
      label: "Total Ideas",
      value: allIdeas.length,
      note: "All submitted ideas",
    },
    {
      label: "Proposed",
      value: proposedIdeas.length,
      note: "Ideas still open",
    },
    {
      label: "Implemented",
      value: implementedIdeas.length,
      note: "Ideas shipped already",
    },
    {
      label: "Total Upvotes",
      value: totalUpvotes ?? "...",
      note: "Current + preserved votes",
    },
    {
      label: "Total Downvotes",
      value: totalDownvotes ?? "...",
      note: "Current + preserved votes",
    },
    {
      label: "Contributors",
      value: contributorCount,
      note: "Distinct idea authors",
    },
    {
      label: "Categories",
      value: categoryCount,
      note: "Idea types represented",
    },
  ];

  const showingProposed = activeView === "proposed";
  const visibleIdeas = showingProposed ? proposedIdeas : implementedIdeas;
  const filteredIdeas = visibleIdeas.filter((ticket) => {
    if (!categoryFilter) {
      return true;
    }

    return ticket.category === categoryFilter;
  });

  const handleIdeaFormToggle = () => {
    setActionErrorMessage("");
    setShowProjectEditForm(false);
    setEditingTicketId("");
    setShowIdeaForm((current) => !current);
  };

  const handleProjectEditToggle = () => {
    setActionErrorMessage("");
    setShowIdeaForm(false);
    setEditingTicketId("");
    setShowProjectEditForm((current) => !current);
  };

  const handleStartEditingTicket = (ticketId) => {
    setActionErrorMessage("");
    setShowProjectEditForm(false);
    setShowIdeaForm(false);
    setEditingTicketId(ticketId);
  };

  const handleCancelEditingTicket = () => {
    setEditingTicketId("");
  };

  const handleVoteClick = async (ticketId, voteType) => {
    if (!currentUser) {
      return;
    }

    const currentVote = userVotesByTicket[ticketId] ?? 0;

    try {
      await onVote(project.id, ticketId, currentVote, voteType);
    } catch (error) {
      console.error("Vote failed:", error);
    }
  };

  const handleDeleteProjectClick = async () => {
    if (!isProjectOwner) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${project.name}" and all of its ideas? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setActionErrorMessage("");
    setIsDeletingProject(true);

    try {
      await onDeleteProject(project.id);
      navigate("/");
    } catch (error) {
      console.error("Project delete failed:", error);
      setActionErrorMessage("We could not delete this project right now.");
    } finally {
      setIsDeletingProject(false);
    }
  };

  const handleDeleteTicketClick = async (ticketId, ticketTitle) => {
    const confirmed = window.confirm(
      `Delete "${ticketTitle}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setActionErrorMessage("");
    setDeletingTicketId(ticketId);

    try {
      await onDeleteTicket(project.id, ticketId);
    } catch (error) {
      console.error("Idea delete failed:", error);
      setActionErrorMessage("We could not delete this idea right now.");
    } finally {
      setDeletingTicketId("");
    }
  };

  const handleMarkImplementedClick = async (ticket) => {
    if (!isProjectOwner) {
      return;
    }

    const confirmed = window.confirm(
      `Move "${ticket.title}" to Already Implemented?`,
    );

    if (!confirmed) {
      return;
    }

    setActionErrorMessage("");
    setMovingTicketId(ticket.id);

    try {
      await onMarkIdeaImplemented(project.id, ticket.id);
    } catch (error) {
      console.error("Unable to mark idea as implemented:", error);
      setActionErrorMessage("We could not move this idea right now.");
    } finally {
      setMovingTicketId("");
    }
  };

  const handleShowProposedIdeas = () => {
    setActiveView("proposed");
  };

  const handleShowImplementedIdeas = () => {
    setShowIdeaForm(false);
    setEditingTicketId("");
    setActiveView("implemented");
  };

  return (
    <div>
      <div className="board-page-header d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <Badge bg="success-subtle" text="success" pill className="mb-2">
            {projectCategoryLabel}
          </Badge>
          <h2 className="page-title mb-2">{project.name} Feedback Board</h2>
          <p className="text-muted mb-1">{project.summary}</p>
          <p className="small text-secondary mb-0">
            Managed by {project.owner}
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap board-page-action">
          {isProjectOwner ? (
            <Button
              variant="outline-success"
              onClick={handleProjectEditToggle}
            >
              {showProjectEditForm ? "Cancel Edit" : "Edit Project"}
            </Button>
          ) : null}

          {isProjectOwner ? (
            <Button
              variant="outline-danger"
              disabled={isDeletingProject}
              onClick={handleDeleteProjectClick}
            >
              {isDeletingProject ? "Deleting Project..." : "Delete Project"}
            </Button>
          ) : null}

          <Button
            className="new-idea-button"
            variant="success"
            disabled={!currentUser}
            onClick={handleIdeaFormToggle}
          >
            {showIdeaForm ? "Cancel" : "+ New Idea"}
          </Button>
        </div>
      </div>

      {!currentUser ? (
        <Alert variant="light" className="border shadow-sm">
          <strong>Want to participate?</strong> Sign in to submit ideas and vote
          on existing tickets.
          <div className="mt-3">
            <Button as={Link} to="/auth" variant="success" size="sm">
              Sign Up / Log In
            </Button>
          </div>
        </Alert>
      ) : null}

      {isProjectOwner ? (
        <Accordion className="board-owner-stats shadow-sm mb-4">
          <Accordion.Item eventKey="0" className="border-0">
            <Accordion.Header>
              <div className="board-owner-header">
                <div>
                  <span className="board-owner-title">Project Overview</span>
                  <span className="board-owner-subtitle">
                    Owner-only project statistics
                  </span>
                </div>
                <Badge bg="light" text="dark" className="board-owner-badge">
                  Owner view
                </Badge>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <div className="board-stat-grid">
                {ownerStatCards.map((stat) => (
                  <Card
                    className="mini-summary board-stat-card border-0 shadow-sm"
                    key={stat.label}
                  >
                    <Card.Body>
                      <div className="summary-number">{stat.value}</div>
                      <p className="summary-label">{stat.label}</p>
                      <p className="summary-note">{stat.note}</p>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      ) : null}

      {showProjectEditForm && isProjectOwner ? (
        <div className="mb-4">
          <ProductForm
            initialData={project}
            title="Edit project details"
            description="Update the project name, category, owner, or summary without affecting existing ideas."
            submitLabel="Save Changes"
            submittingLabel="Saving..."
            errorMessageText="We could not save the project changes right now. Please try again."
            navigateOnSuccess={false}
            onSubmitProject={(formData) => onEditProject(project.id, formData)}
            onSuccess={() => setShowProjectEditForm(false)}
            onCancel={() => setShowProjectEditForm(false)}
          />
        </div>
      ) : null}

      {showIdeaForm && currentUser ? (
        <IdeaFormPanel
          title="Submit a New Idea"
          description="Share a feature request, bug report, or other product feedback for this board."
          initialData={emptyIdeaForm}
          onSubmitIdea={(formData) => onAddTicket(project.id, formData)}
          onSuccess={() => {
            setShowIdeaForm(false);
            setActiveView("proposed");
          }}
          submitLabel="Add Idea"
          submittingLabel="Adding..."
          errorMessageText="We could not submit your idea right now. Please try again."
          idPrefix="ideaCreate"
          className="mb-4"
        />
      ) : null}

      {actionErrorMessage ? (
        <Alert variant="danger" className="border-0 shadow-sm mb-4">
          {actionErrorMessage}
        </Alert>
      ) : null}
      <Card className="board-shell border-0 shadow-sm">
        <Card.Body>
          <div className="board-section-header d-flex flex-wrap justify-content-between gap-3 mb-4">
            <div>
              <h3 className="section-title mb-1">
                {showingProposed ? "Proposed ideas" : "Already implemented"}
              </h3>
              <p className="text-muted mb-0">
                {showingProposed
                  ? "These are feature requests and improvements users want next."
                  : "These ideas have already been added to the product."}
              </p>
            </div>

            <div className="board-section-controls">
              <Form.Group
                controlId="ideaCategoryFilter"
                className="board-filter-group board-control-stack"
              >
                <Form.Label className="small text-muted mb-1">
                  Filter by category
                </Form.Label>
                <Form.Select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  aria-label="Filter ideas by category"
                >
                  <option value="">All categories</option>
                  {IDEA_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="board-control-stack">
                <div className="board-control-label">View</div>
                <ButtonGroup className="board-view-toggle">
                  <Button
                    variant={showingProposed ? "success" : "outline-success"}
                    onClick={handleShowProposedIdeas}
                  >
                    Proposed Ideas
                  </Button>
                  <Button
                    variant={!showingProposed ? "success" : "outline-success"}
                    onClick={handleShowImplementedIdeas}
                  >
                    Already Implemented
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </div>

          <div className="idea-list">
            {filteredIdeas.length > 0 ? (
              filteredIdeas.map((ticket) => {
                const currentUserVote = userVotesByTicket[ticket.id] ?? 0;
                const isIdeaCreator = currentUser?.uid === ticket.createdByUid;
                const isEditingThisTicket = editingTicketId === ticket.id;

                if (isEditingThisTicket) {
                  return (
                    <Card className="ticket-card mb-3" key={ticket.id}>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
                          <div>
                            <h4 className="ticket-title mb-1">Edit Idea</h4>
                            <p className="text-muted mb-0">
                              Update the title, description, or category for
                              this ticket.
                            </p>
                          </div>
                          <Badge
                            bg="light"
                            text="dark"
                            className="idea-category-badge"
                          >
                            {getCategoryLabel(ticket.category)}
                          </Badge>
                        </div>

                        <IdeaFormPanel
                          title=""
                          description=""
                          initialData={ticket}
                          onSubmitIdea={(formData) =>
                            onEditTicket(project.id, ticket.id, formData)
                          }
                          onSuccess={() => setEditingTicketId("")}
                          onCancel={handleCancelEditingTicket}
                          submitLabel="Save Changes"
                          submittingLabel="Saving..."
                          errorMessageText="We could not save your idea changes right now. Please try again."
                          idPrefix={`ideaEdit${ticket.id}`}
                          withCard={false}
                        />
                      </Card.Body>
                    </Card>
                  );
                }

                return (
                  <Card className="ticket-card mb-3" key={ticket.id}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                            <h4 className="ticket-title mb-0">{ticket.title}</h4>
                            <Badge bg="light" text="dark" className="idea-category-badge">
                              {getCategoryLabel(ticket.category)}
                            </Badge>
                          </div>
                          <p className="text-muted mb-0">
                            {ticket.description}
                          </p>

                          <div className="mt-3 d-flex gap-2 flex-wrap">
                            {showingProposed && isIdeaCreator ? (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() =>
                                  handleStartEditingTicket(ticket.id)
                                }
                              >
                                Edit
                              </Button>
                            ) : null}

                            {showingProposed &&
                            (currentUser?.uid === ticket.createdByUid ||
                              isProjectOwner) ? (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                disabled={deletingTicketId === ticket.id}
                                onClick={() =>
                                  handleDeleteTicketClick(
                                    ticket.id,
                                    ticket.title,
                                  )
                                }
                              >
                                {deletingTicketId === ticket.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </Button>
                            ) : null}

                            {showingProposed && isProjectOwner ? (
                              <Button
                                variant="outline-success"
                                size="sm"
                                disabled={movingTicketId === ticket.id}
                                onClick={() =>
                                  handleMarkImplementedClick(ticket)
                                }
                              >
                                {movingTicketId === ticket.id
                                  ? "Moving..."
                                  : "Mark Implemented"}
                              </Button>
                            ) : null}
                          </div>
                        </div>

                        {showingProposed ? (
                          <div className="vote-actions d-flex align-items-center gap-3">
                            <div className="vote-pill">
                              <span className="vote-number">
                                {ticket.votes}
                              </span>
                              <span className="vote-text">votes</span>
                            </div>

                            <div className="vote-button-column d-flex flex-column gap-2">
                              <Button
                                variant={
                                  currentUserVote === 1
                                    ? "success"
                                    : "outline-success"
                                }
                                disabled={!currentUser}
                                onClick={() => handleVoteClick(ticket.id, "up")}
                              >
                                Upvote
                              </Button>

                              <Button
                                variant={
                                  currentUserVote === -1
                                    ? "danger"
                                    : "outline-danger"
                                }
                                disabled={!currentUser}
                                onClick={() =>
                                  handleVoteClick(ticket.id, "down")
                                }
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
                {categoryFilter
                  ? showingProposed
                    ? "No proposed ideas match the selected category yet."
                    : "No implemented ideas match the selected category yet."
                  : showingProposed
                    ? "No proposed ideas have been listed for this project yet."
                    : "No implemented ideas have been listed for this project yet."}
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default BoardPreview;
