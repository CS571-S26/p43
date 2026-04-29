import ProductForm from '../components/ProductForm';

function CreateProjectPage({ onAddProject }) {
  return (
    <section className="mb-4">
      <div className="section-header">
        <div>
          <h2 className="section-title">Create a New Project</h2>
          <p className="section-subtitle">
            Start a shared Firebase-backed feedback board with a structured category.
          </p>
        </div>
      </div>

      <ProductForm onAddProject={onAddProject} />
    </section>
  );
}

export default CreateProjectPage;
