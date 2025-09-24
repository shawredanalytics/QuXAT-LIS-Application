import React, { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Download,
  Filter,
  PieChart,
  Activity
} from 'lucide-react'

const Reports = () => {
  const [dateRange, setDateRange] = useState('last30days')
  const [reportType, setReportType] = useState('overview')

  const stats = {
    totalTests: 1247,
    completedTests: 1156,
    pendingTests: 91,
    averageTime: '2.4 hours',
    testsByCategory: [
      { name: 'Hematology', count: 345, percentage: 28 },
      { name: 'Chemistry', count: 298, percentage: 24 },
      { name: 'Microbiology', count: 234, percentage: 19 },
      { name: 'Immunology', count: 187, percentage: 15 },
      { name: 'Endocrinology', count: 183, percentage: 14 }
    ],
    dailyVolume: [
      { date: '2024-01-08', tests: 45 },
      { date: '2024-01-09', tests: 52 },
      { date: '2024-01-10', tests: 38 },
      { date: '2024-01-11', tests: 61 },
      { date: '2024-01-12', tests: 47 },
      { date: '2024-01-13', tests: 55 },
      { date: '2024-01-14', tests: 49 }
    ]
  }

  const reportTypes = [
    { value: 'overview', label: 'Overview Report' },
    { value: 'productivity', label: 'Productivity Report' },
    { value: 'quality', label: 'Quality Control Report' },
    { value: 'financial', label: 'Financial Report' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <button className="btn-primary flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select 
              className="input-field"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select 
              className="input-field"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last3months">Last 3 Months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="btn-secondary flex items-center space-x-2 w-full">
              <Filter className="h-4 w-4" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTests}</p>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-500">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedTests}</p>
              <p className="text-sm text-green-600">
                {((stats.completedTests / stats.totalTests) * 100).toFixed(1)}% completion rate
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-500">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingTests}</p>
              <p className="text-sm text-yellow-600">
                {((stats.pendingTests / stats.totalTests) * 100).toFixed(1)}% pending
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageTime}</p>
              <p className="text-sm text-blue-600">
                -15 min from last month
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Categories Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Tests by Category</h2>
            <PieChart className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            {stats.testsByCategory.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ 
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)` 
                    }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{category.count}</div>
                  <div className="text-xs text-gray-500">{category.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Test Volume */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Daily Test Volume</h2>
            <BarChart3 className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-2">
            {stats.dailyVolume.map((day, index) => {
              const maxTests = Math.max(...stats.dailyVolume.map(d => d.tests))
              const percentage = (day.tests / maxTests) * 100
              
              return (
                <div key={day.date} className="flex items-center space-x-3">
                  <div className="w-16 text-xs text-gray-500">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                    <div 
                      className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-xs font-medium text-gray-900 text-right">
                    {day.tests}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Analysis</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Previous Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Total Tests Processed
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1,247</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1,113</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+12.0%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Average Turnaround Time
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2.4 hours</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2.7 hours</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">-11.1%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Quality Control Pass Rate
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">98.7%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">97.9%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+0.8%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Patient Satisfaction
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">4.6/5.0</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">4.4/5.0</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+4.5%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports