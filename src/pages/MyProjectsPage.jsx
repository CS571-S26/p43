import { Alert } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';

function MyProjectsPage({ projects, currentUser, projectsLoading }) {
  if (projectsLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div>Loading...</div>
      </div>
    );
  }

  const myProjects = projects.filter(
    (project) => project.createdByUid === currentUser.uid,
  );

  return (
    <div>
      <section className="mb-5">
        <div className="section-header">
          <div>
            <h2 className="section-title">My Projects</h2>
            <p className="section-subtitle">
              These are the projects you created.
            </p>
          </div>
        </div>

        {myProjects.length > 0 ? (
          <div className="row g-4">
            {myProjects.map((project) => (
              <div className="col-md-6 col-lg-4" key={project.id}>
                <ProductCard project={project} />
              </div>
            ))}
          </div>
        ) : (
          <Alert variant="light" className="border shadow-sm mt-4">
            <strong>You have not created any projects yet.</strong>
            <div className="mt-2 text-muted">
              Create a project and it will appear here.
            </div>
          </Alert>
        )}
      </section>
    </div>
  );
}

export default MyProjectsPage;