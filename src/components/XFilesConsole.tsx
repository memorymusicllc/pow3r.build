import React, { useState } from 'react'

interface XFilesConsoleProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * X-FILES Console Component
 * In-Situ Triage & Action Console for anomaly detection
 * 
 * Constitutional Compliance:
 * - Article VI: X-FILES System
 * - Article VII: Case File Management
 */

const XFilesConsole: React.FC<XFilesConsoleProps> = ({ isOpen, onClose }) => {
  const [caseType, setCaseType] = useState('BugReport')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const caseFile = {
        type: caseType,
        title,
        description,
        priority,
        timestamp: new Date().toISOString(),
        status: 'Open',
        constitution: 'Project Phoenix Constitution v3.0 (X-FILES Edition)'
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('X-FILES Case File Created:', caseFile)
      
      // Reset form
      setTitle('')
      setDescription('')
      setPriority('medium')
      
      // Close modal
      onClose()
      
    } catch (error) {
      console.error('Failed to create case file:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              🔍 X-FILES Console
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="mb-6 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <h3 className="font-semibold text-blue-400 mb-2">In-Situ Triage & Action Console</h3>
            <p className="text-sm text-blue-300">
              Report anomalies, bugs, or feature requests. The X-FILES system will automatically 
              analyze, create case files, and dispatch appropriate agents for resolution.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Case Type
              </label>
              <select
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BugReport">Bug Report</option>
                <option value="FeatureRequest">Feature Request</option>
                <option value="SystemAnomaly">System Anomaly</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the issue or request"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed description of the issue, steps to reproduce, or feature requirements"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-md transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating Case File...' : 'Create Case File'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default XFilesConsole