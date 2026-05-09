import { useState } from 'react'
import { Link } from 'react-router-dom'
import ComplaintForm from '../components/complaint/ComplaintForm'
import Alert from '../components/common/Alert'

const FileComplaint = () => {
  const [success, setSuccess] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 transition-colors duration-200">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">File a Complaint</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Report waste management issues in your area</p>
        </div>
        {success && (
          <div className="mb-6">
            <Alert type="success" message="Complaint filed successfully! Track its status below." autoDismiss={false} />
            <Link to="/track-complaint" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700">
              View My Complaints →
            </Link>
          </div>
        )}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 transition-colors duration-200">
          <ComplaintForm onSuccess={() => setSuccess(true)} />
        </div>
      </div>
    </div>
  )
}

export default FileComplaint