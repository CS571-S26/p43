import { useEffect, useState } from "react";
import { Alert, Button, Container, Spinner } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import BoardPreview from "../components/BoardPreview";
import { db } from "../lib/firebase";

function FeedbackBoardPage({
  projects,
  projectsLoading,
  currentUser,
  onAddTicket,
  onEditProject,
  onEditTicket,
  onVote,
  onDeleteProject,
  onDeleteTicket,
  onMarkIdeaImplemented,
}) {
  const { projectId } = useParams();
  const project = projects.find((item) => item.id === projectId);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [userVotesByTicket, setUserVotesByTicket] = useState({});
  const [ownerVoteData, setOwnerVoteData] = useState({
    projectId: "",
    votes: [],
  });
  const isProjectOwner = project?.createdByUid === currentUser?.uid;

  useEffect(() => {
    if (!projectId) {
      return undefined;
    }

    const ticketsCollection = collection(db, "projects", projectId, "tickets");

    const unsubscribe = onSnapshot(ticketsCollection, (snapshot) => {
      const nextTickets = snapshot.docs.map((ticketDoc) => ({
        id: ticketDoc.id,
        ...ticketDoc.data(),
      }));

      setTickets(nextTickets);
      setTicketsLoading(false);
    });

    return unsubscribe;
  }, [projectId]);

  useEffect(() => {
    if (!projectId || !currentUser) {
      return undefined;
    }

    const votesQuery = query(
      collection(db, "projects", projectId, "votes"),
      where("userId", "==", currentUser.uid),
    );

    const unsubscribe = onSnapshot(votesQuery, (snapshot) => {
      const nextVotes = {};

      snapshot.docs.forEach((voteDoc) => {
        const vote = voteDoc.data();
        nextVotes[vote.ticketId] = vote.value;
      });

      setUserVotesByTicket(nextVotes);
    });

    return unsubscribe;
  }, [projectId, currentUser]);

  useEffect(() => {
    if (!projectId || !isProjectOwner) {
      return undefined;
    }

    const votesCollection = collection(db, "projects", projectId, "votes");

    const unsubscribe = onSnapshot(votesCollection, (snapshot) => {
      const nextVotes = snapshot.docs.map((voteDoc) => ({
        id: voteDoc.id,
        ...voteDoc.data(),
      }));

      setOwnerVoteData({
        projectId,
        votes: nextVotes,
      });
    });

    return unsubscribe;
  }, [projectId, isProjectOwner]);

  const ownerVoteRecords =
    isProjectOwner && ownerVoteData.projectId === projectId
      ? ownerVoteData.votes
      : [];
  const ownerStatsLoading =
    isProjectOwner && ownerVoteData.projectId !== projectId;

  if (projectsLoading || ticketsLoading) {
    return (
      <div className="page-section">
        <Container className="d-flex justify-content-center py-5">
          <Spinner animation="border" role="status" />
        </Container>
      </div>
    );
  }

  return (
    <div className="page-section">
      <Container>
        {!project ? (
          <Alert variant="warning" className="shadow-sm border-0">
            <Alert.Heading>Project not found</Alert.Heading>
            <p className="mb-3">
              This board does not exist or has been removed.
            </p>
            <Button as={Link} to="/" variant="success">
              Back to Home
            </Button>
          </Alert>
        ) : (
          <BoardPreview
            project={project}
            tickets={tickets}
            currentUser={currentUser}
            userVotesByTicket={userVotesByTicket}
            ownerVoteRecords={ownerVoteRecords}
            ownerStatsLoading={ownerStatsLoading}
            onAddTicket={onAddTicket}
            onEditProject={onEditProject}
            onEditTicket={onEditTicket}
            onVote={onVote}
            onDeleteProject={onDeleteProject}
            onDeleteTicket={onDeleteTicket}
            onMarkIdeaImplemented={onMarkIdeaImplemented}
          />
        )}
      </Container>
    </div>
  );
}

export default FeedbackBoardPage;
