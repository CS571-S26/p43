import { useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import { PROJECT_CATEGORIES } from '../constants/categories';

function MyProjectsPage({ projects, currentUser, projectsLoading }) {
  const [categoryFilter, setCategoryFilter] = useState('');

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
  const filteredProjects = myProjects.filter(
    (project) => !categoryFilter || project.category === categoryFilter,
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
          <>
            <div className="project-filter-bar mb-4">
              <Form.Group
                controlId="myProjectsCategoryFilter"
                className="project-filter-field"
              >
                <Form.Label>Filter by project category</Form.Label>
                <Form.Select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                >
                  <option value="">All categories</option>
                  {PROJECT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text muted className="project-filter-meta">
                  Focus on one project type at a time while keeping older
                  projects safe.
                </Form.Text>
              </Form.Group>
              <p className="project-filter-meta project-search-results mb-0">
                Showing {filteredProjects.length} of {myProjects.length}{" "}
                projects
              </p>
            </div>

            {filteredProjects.length > 0 ? (
              <div className="row g-4">
                {filteredProjects.map((project) => (
                  <div className="col-md-6 col-lg-4" key={project.id}>
                    <ProductCard project={project} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state mt-4">
                No projects match the selected category.
              </div>
            )}
          </>
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
