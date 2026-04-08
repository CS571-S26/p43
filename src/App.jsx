import { useState } from "react";
import { Container } from "react-bootstrap";
import { Routes, Route } from "react-router-dom";
import AppNavbar from "./components/AppNavbar";
import HomePage from "./pages/HomePage";
import FeedbackBoardPage from "./pages/FeedbackBoardPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import { initialProjects } from "./data/mockProjects";
import "./App.css";

function App() {
  const [projects, setProjects] = useState(initialProjects);

  const handleAddProject = (newProject) => {
    const createdProject = {
      ...newProject,
      id: Date.now().toString(),
      tickets: [],
      implementedIdeas: [],
    };

    setProjects((prevProjects) => [...prevProjects, createdProject]);
    return createdProject.id;
  };

  const handleAddTicket = (projectId, newTicket) => {
    const createdTicket = {
      id: crypto.randomUUID(),
      title: newTicket.title,
      description: newTicket.description,
      votes: 0,
      userVote: 0,
    };

    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tickets: [...project.tickets, createdTicket],
            }
          : project,
      ),
    );
  };

  const handleVote = (projectId, ticketId, voteType) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tickets: project.tickets.map((ticket) => {
                if (ticket.id !== ticketId) {
                  return ticket;
                }

                const currentUserVote = ticket.userVote ?? 0;
                let updatedVotes = ticket.votes;
                let updatedUserVote = currentUserVote;

                if (voteType === "up") {
                  if (currentUserVote === 1) {
                    updatedVotes -= 1;
                    updatedUserVote = 0;
                  } else if (currentUserVote === 0) {
                    updatedVotes += 1;
                    updatedUserVote = 1;
                  } else if (currentUserVote === -1) {
                    updatedVotes += 2;
                    updatedUserVote = 1;
                  }
                }

                if (voteType === "down") {
                  if (currentUserVote === -1) {
                    updatedVotes += 1;
                    updatedUserVote = 0;
                  } else if (currentUserVote === 0) {
                    updatedVotes -= 1;
                    updatedUserVote = -1;
                  } else if (currentUserVote === 1) {
                    updatedVotes -= 2;
                    updatedUserVote = -1;
                  }
                }

                return {
                  ...ticket,
                  votes: updatedVotes,
                  userVote: updatedUserVote,
                };
              }),
            }
          : project,
      ),
    );
  };

  return (
    <div className="app-shell">
      <AppNavbar />
      <Container className="py-4">
        <Routes>
          <Route path="/" element={<HomePage projects={projects} />} />
          <Route
            path="/create"
            element={<CreateProjectPage onAddProject={handleAddProject} />}
          />
          <Route
            path="/board/:projectId"
            element={
              <FeedbackBoardPage
                projects={projects}
                onAddTicket={handleAddTicket}
                onVote={handleVote}
              />
            }
          />
        </Routes>
      </Container>
    </div>
  );
}

export default App;
