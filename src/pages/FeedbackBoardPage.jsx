import { Alert, Button, Container } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import BoardPreview from '../components/BoardPreview'

function FeedbackBoardPage({ projects }) {
  const { projectId } = useParams()
  const project = projects.find((item) => item.id === projectId)

  return (
    <div className="page-section">
      <Container>
        {!project ? (
          <Alert variant="warning" className="shadow-sm border-0">
            <Alert.Heading>Project not found</Alert.Heading>
            <p className="mb-3">
              This starter app only includes a few sample boards right now.
            </p>
            <Button as={Link} to="/" variant="success">
              Back to Home
            </Button>
          </Alert>
        ) : (
          <BoardPreview project={project} />
        )}
      </Container>
    </div>
  )
}

export default FeedbackBoardPage