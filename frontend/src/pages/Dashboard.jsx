import React from 'react'
import { 
  Users, 
  TestTube, 
  FileCheck, 
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Patients',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Tests Today',
      value: '89',
      change: '+5%',
      icon: TestTube,
      color: 'bg-green-500'
    },
    {
      title: 'Pending Results',
      value: '23',
      change: '-8%',
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Completed Tests',
      value: '156',
      change: '+15%',
      icon: FileCheck,
      color: 'bg-purple-500'
    }
  ]

  const recentTests = [
    { id: 'T001', patient: 'John Doe', test: 'Complete Blood Count', status: 'Completed', time: '2 hours ago' },
    { id: 'T002', patient: 'Jane Smith', test: 'Lipid Profile', status: 'In Progress', time: '4 hours ago' },
    { id: 'T003', patient: 'Mike Johnson', test: 'Liver Function Test', status: 'Pending', time: '6 hours ago' },
    { id: 'T004', patient: 'Sarah Wilson', test: 'Thyroid Function', status: 'Completed', time: '8 hours ago' },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100'
      case 'In Progress': return 'text-blue-600 bg-blue-100'
      case 'Pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Tests</h2>
          <div className="space-y-3">
            {recentTests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">{test.id}</span>
                    <span className="text-gray-600">{test.patient}</span>
                  </div>
                  <p className="text-sm text-gray-500">{test.test}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                    {test.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{test.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Alerts</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Equipment Maintenance Due</p>
                <p className="text-sm text-yellow-700">Hematology analyzer requires calibration</p>
                <p className="text-xs text-yellow-600 mt-1">Due in 2 days</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">New Test Protocol Available</p>
                <p className="text-sm text-blue-700">COVID-19 Antigen test protocol updated</p>
                <p className="text-xs text-blue-600 mt-1">Review required</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Quality Control Passed</p>
                <p className="text-sm text-green-700">All daily QC tests completed successfully</p>
                <p className="text-xs text-green-600 mt-1">Today at 9:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard