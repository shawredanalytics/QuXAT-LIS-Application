import React, { useState } from 'react'
import { 
  Search, 
  Plus, 
  TestTube, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Filter
} from 'lucide-react'

const Tests = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showOrderModal, setShowOrderModal] = useState(false)

  const tests = [
    {
      id: 'T001',
      patientId: 'P001',
      patientName: 'John Doe',
      testType: 'Complete Blood Count',
      category: 'Hematology',
      orderedBy: 'Dr. Smith',
      orderDate: '2024-01-15',
      status: 'Completed',
      priority: 'Normal',
      results: 'Available'
    },
    {
      id: 'T002',
      patientId: 'P002',
      patientName: 'Jane Smith',
      testType: 'Lipid Profile',
      category: 'Chemistry',
      orderedBy: 'Dr. Johnson',
      orderDate: '2024-01-15',
      status: 'In Progress',
      priority: 'Normal',
      results: 'Pending'
    },
    {
      id: 'T003',
      patientId: 'P003',
      patientName: 'Mike Johnson',
      testType: 'Liver Function Test',
      category: 'Chemistry',
      orderedBy: 'Dr. Brown',
      orderDate: '2024-01-14',
      status: 'Sample Collected',
      priority: 'Urgent',
      results: 'Pending'
    },
    {
      id: 'T004',
      patientId: 'P004',
      patientName: 'Sarah Wilson',
      testType: 'Thyroid Function',
      category: 'Endocrinology',
      orderedBy: 'Dr. Davis',
      orderDate: '2024-01-14',
      status: 'Completed',
      priority: 'Normal',
      results: 'Available'
    }
  ]

  const testCategories = [
    'Hematology',
    'Chemistry',
    'Microbiology',
    'Immunology',
    'Endocrinology',
    'Molecular Biology'
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'In Progress': return <Clock className="h-4 w-4 text-blue-500" />
      case 'Sample Collected': return <TestTube className="h-4 w-4 text-yellow-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100'
      case 'In Progress': return 'text-blue-600 bg-blue-100'
      case 'Sample Collected': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'text-red-600 bg-red-100'
      case 'High': return 'text-orange-600 bg-orange-100'
      case 'Normal': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredTests = tests.filter(test =>
    test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.testType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Test Management</h1>
        <button 
          onClick={() => setShowOrderModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Order Test</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search tests by patient, test ID, or test type..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-secondary flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Tests Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordered By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTests.map((test) => (
                <tr key={test.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{test.testType}</div>
                      <div className="text-sm text-gray-500">ID: {test.id}</div>
                      <div className="text-sm text-gray-500">{test.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{test.patientName}</div>
                      <div className="text-sm text-gray-500">ID: {test.patientId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{test.orderedBy}</div>
                      <div className="text-sm text-gray-500">{test.orderDate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(test.status)}
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(test.status)}`}>
                        {test.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(test.priority)}`}>
                      {test.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        View
                      </button>
                      {test.results === 'Available' && (
                        <button className="text-green-600 hover:text-green-900">
                          Results
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Test Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order New Test</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient</label>
                  <select className="input-field">
                    <option>Select Patient</option>
                    <option>John Doe (P001)</option>
                    <option>Jane Smith (P002)</option>
                    <option>Mike Johnson (P003)</option>
                    <option>Sarah Wilson (P004)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Test Category</label>
                  <select className="input-field">
                    <option>Select Category</option>
                    {testCategories.map(category => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Test Type</label>
                  <select className="input-field">
                    <option>Select Test Type</option>
                    <option>Complete Blood Count</option>
                    <option>Lipid Profile</option>
                    <option>Liver Function Test</option>
                    <option>Thyroid Function</option>
                    <option>Blood Glucose</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select className="input-field">
                    <option>Normal</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ordered By</label>
                  <input type="text" className="input-field" placeholder="Doctor name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea className="input-field" rows="3" placeholder="Additional notes..."></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Order Test
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tests