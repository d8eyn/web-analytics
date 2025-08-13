'use client'

import { useState } from 'react'

// Simple form components replacement
function Select({ children, value, onValueChange, placeholder, className = '', ...props }: any) {
  return (
    <select 
      value={value} 
      onChange={(e) => onValueChange?.(e.target.value)}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      {...props}
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  )
}

function SelectItem({ value, children }: any) {
  return <option value={value}>{children}</option>
}

function TextInput({ value, onValueChange, placeholder, className = '', ...props }: any) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      {...props}
    />
  )
}

function Button({ children, onClick, className = '', variant = 'primary', disabled = false, ...props }: any) {
  const baseClasses = 'px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variantClasses: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500'
  }
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

interface CredentialsFormProps {
  onSubmit: (credentials: { host: string; token: string; siteId: string }) => void
  loading?: boolean
}

export default function CredentialsForm({ onSubmit, loading = false }: CredentialsFormProps) {
  const [host, setHost] = useState('')
  const [token, setToken] = useState('')
  const [siteId, setSiteId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (host && token && siteId) {
      onSubmit({ host, token, siteId })
    }
  }

  const isValid = host && token && siteId

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="host" className="block text-sm font-medium text-gray-700 mb-1">
          Tinybird Host
        </label>
        <Select
          value={host}
          onValueChange={setHost}
          placeholder="Select your region"
        >
          <SelectItem value="https://api.tinybird.co">Europe (api.tinybird.co)</SelectItem>
          <SelectItem value="https://api.us-east.tinybird.co">US East (api.us-east.tinybird.co)</SelectItem>
        </Select>
      </div>

      <div>
        <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
          API Token
        </label>
        <TextInput
          value={token}
          onValueChange={setToken}
          placeholder="Enter your Tinybird API token"
        />
      </div>

      <div>
        <label htmlFor="siteId" className="block text-sm font-medium text-gray-700 mb-1">
          Site ID
        </label>
        <TextInput
          value={siteId}
          onValueChange={setSiteId}
          placeholder="Enter your site ID"
        />
      </div>

      <Button
        type="submit"
        disabled={!isValid || loading}
        className="w-full"
      >
        {loading ? 'Connecting...' : 'Connect'}
      </Button>
    </form>
  )
}
