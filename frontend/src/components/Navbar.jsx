import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Users, 
  TestTube, 
  FileText, 
  BarChart3, 
  Settings,
  Activity
} from 'lucide-react'

const Navbar = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', name: 'Dashboard', icon: Home },
    { path: '/patients', name: 'Patients', icon: Users },
    { path: '/tests', name: 'Tests', icon: TestTube },
    { path: '/results', name: 'Results', icon: FileText },
    { path: '/reports', name: 'Reports', icon: BarChart3 },
    { path: '/settings', name: 'Settings', icon: Settings },
  ]

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">QuXAT LIS</span>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Welcome, Lab Admin
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">LA</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar