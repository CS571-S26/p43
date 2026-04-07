import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import HomePage from './pages/HomePage';
import FeedbackBoardPage from './pages/FeedbackBoardPage';
import CreateProjectPage from './pages/CreateProjectPage.jsx';
import { initialProjects } from './data/mockProjects';
import './App.css';

function App() {
  const [projects, setProjects] = useState(initialProjects);

  const handleAddProject = (newProject) => {
    const createdProject = {
      ...newProject,
      id: Date.now().toString(),
      tickets: [],
    };

    setProjects((prevProjects) => [...prevProjects, createdProject]);
    return createdProject.id;
  };

  return (
    <div className="app-shell">
      <AppNavbar />
      <Container className="py-4">
        <Routes>
          <Route
            path="/"
            element={<HomePage projects={projects} />}
          />
          <Route
            path="/create"
            element={<CreateProjectPage onAddProject={handleAddProject} />}
          />
          <Route
            path="/board/:projectId"
            element={<FeedbackBoardPage projects={projects} />}
          />
        </Routes>
      </Container>
    </div>
  );
}

export default App;