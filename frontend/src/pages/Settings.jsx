import React, { useState } from 'react'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database,
  Printer,
  Mail,
  Save,
  TestTube
} from 'lucide-react'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'users', name: 'Users', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'lab', name: 'Lab Config', icon: TestTube },
    { id: 'system', name: 'System', icon: Database }
  ]

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Laboratory Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Laboratory Name</label>
            <input type="text" className="input-field" defaultValue="QuXAT Clinical Laboratory" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">License Number</label>
            <input type="text" className="input-field" defaultValue="LAB-2024-001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input type="text" className="input-field" defaultValue="123 Medical Center Dr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input type="tel" className="input-field" defaultValue="+1-555-LAB-TEST" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" className="input-field" defaultValue="info@quxatlab.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Director</label>
            <input type="text" className="input-field" defaultValue="Dr. Sarah Johnson, MD" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Default Language</label>
              <p className="text-sm text-gray-500">Set the default language for the system</p>
            </div>
            <select className="input-field w-32">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Time Zone</label>
              <p className="text-sm text-gray-500">Set the default time zone</p>
            </div>
            <select className="input-field w-48">
              <option>UTC-5 (Eastern Time)</option>
              <option>UTC-6 (Central Time)</option>
              <option>UTC-7 (Mountain Time)</option>
              <option>UTC-8 (Pacific Time)</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Date Format</label>
              <p className="text-sm text-gray-500">Choose how dates are displayed</p>
            </div>
            <select className="input-field w-32">
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderUserSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">User Management</h3>
        <button className="btn-primary">Add User</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">LA</span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Lab Admin</div>
                    <div className="text-sm text-gray-500">admin@quxatlab.com</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Administrator</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 hours ago</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                <button className="text-red-600 hover:text-red-900">Disable</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">Email Notifications</div>
              <div className="text-sm text-gray-500">Receive notifications via email</div>
            </div>
          </div>
          <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Bell className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">Test Completion Alerts</div>
              <div className="text-sm text-gray-500">Get notified when tests are completed</div>
            </div>
          </div>
          <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <TestTube className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">Critical Results</div>
              <div className="text-sm text-gray-500">Immediate alerts for critical test results</div>
            </div>
          </div>
          <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Printer className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">Equipment Maintenance</div>
              <div className="text-sm text-gray-500">Alerts for equipment maintenance schedules</div>
            </div>
          </div>
          <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
        </div>
      </div>
    </div>
  )

  const renderLabConfig = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Laboratory Configuration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Test Categories</h4>
          <div className="space-y-2">
            {['Hematology', 'Chemistry', 'Microbiology', 'Immunology', 'Endocrinology'].map(category => (
              <div key={category} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm text-gray-900">{category}</span>
                <button className="text-blue-600 text-sm">Configure</button>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Reference Ranges</h4>
          <div className="space-y-2">
            <div className="p-3 border rounded-lg">
              <div className="text-sm font-medium text-gray-900">Age Groups</div>
              <div className="text-sm text-gray-500">Pediatric, Adult, Geriatric</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-sm font-medium text-gray-900">Gender Specific</div>
              <div className="text-sm text-gray-500">Male, Female specific ranges</div>
            </div>
            <button className="btn-secondary w-full">Manage Reference Ranges</button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <button className="btn-primary flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="card">
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'users' && renderUserSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'lab' && renderLabConfig()}
            {activeTab === 'security' && (
              <div className="text-center py-12 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Security settings panel coming soon</p>
              </div>
            )}
            {activeTab === 'system' && (
              <div className="text-center py-12 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>System settings panel coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings