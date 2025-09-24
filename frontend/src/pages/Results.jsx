import React, { useState } from 'react'
import { 
  Search, 
  Download, 
  Eye, 
  FileText,
  Calendar,
  User,
  TestTube
} from 'lucide-react'

const Results = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedResult, setSelectedResult] = useState(null)

  const results = [
    {
      id: 'R001',
      testId: 'T001',
      patientId: 'P001',
      patientName: 'John Doe',
      testType: 'Complete Blood Count',
      completedDate: '2024-01-15',
      reportedBy: 'Dr. Lab Tech',
      status: 'Final',
      values: {
        'Hemoglobin': { value: '14.2', unit: 'g/dL', range: '13.5-17.5', status: 'Normal' },
        'WBC Count': { value: '7.8', unit: '10³/μL', range: '4.5-11.0', status: 'Normal' },
        'Platelet Count': { value: '285', unit: '10³/μL', range: '150-450', status: 'Normal' },
        'Hematocrit': { value: '42.1', unit: '%', range: '41-53', status: 'Normal' }
      }
    },
    {
      id: 'R002',
      testId: 'T004',
      patientId: 'P004',
      patientName: 'Sarah Wilson',
      testType: 'Thyroid Function',
      completedDate: '2024-01-14',
      reportedBy: 'Dr. Lab Tech',
      status: 'Final',
      values: {
        'TSH': { value: '2.8', unit: 'mIU/L', range: '0.4-4.0', status: 'Normal' },
        'Free T4': { value: '1.2', unit: 'ng/dL', range: '0.8-1.8', status: 'Normal' },
        'Free T3': { value: '3.1', unit: 'pg/mL', range: '2.3-4.2', status: 'Normal' }
      }
    }
  ]

  const filteredResults = results.filter(result =>
    result.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.testType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getValueStatus = (status) => {
    switch (status) {
      case 'Normal': return 'text-green-600'
      case 'High': return 'text-red-600'
      case 'Low': return 'text-blue-600'
      case 'Critical': return 'text-red-800 font-bold'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Test Results</h1>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search results by patient, result ID, or test type..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Results List */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Results</h2>
          <div className="space-y-3">
            {filteredResults.map((result) => (
              <div 
                key={result.id} 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedResult?.id === result.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedResult(result)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{result.id}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {result.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3" />
                        <span>{result.patientName} ({result.patientId})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TestTube className="h-3 w-3" />
                        <span>{result.testType}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span>{result.completedDate}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-800">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Result Details */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Result Details</h2>
          
          {selectedResult ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Result ID:</span>
                    <p className="text-gray-900">{selectedResult.id}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Test ID:</span>
                    <p className="text-gray-900">{selectedResult.testId}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Patient:</span>
                    <p className="text-gray-900">{selectedResult.patientName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Test Type:</span>
                    <p className="text-gray-900">{selectedResult.testType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Completed:</span>
                    <p className="text-gray-900">{selectedResult.completedDate}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Reported By:</span>
                    <p className="text-gray-900">{selectedResult.reportedBy}</p>
                  </div>
                </div>
              </div>

              {/* Test Values */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Test Values</h3>
                <div className="space-y-3">
                  {Object.entries(selectedResult.values).map(([test, data]) => (
                    <div key={test} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{test}</div>
                        <div className="text-sm text-gray-500">Reference: {data.range}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getValueStatus(data.status)}`}>
                          {data.value} {data.unit}
                        </div>
                        <div className={`text-sm ${getValueStatus(data.status)}`}>
                          {data.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t">
                <button className="btn-primary flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download Report</span>
                </button>
                <button className="btn-secondary">
                  Print Report
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Select a result from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Results