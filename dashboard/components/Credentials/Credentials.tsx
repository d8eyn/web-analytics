'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Modal from '../Modal'
import CredentialsForm from './CredentialsForm'

export default function Credentials() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsOpen(true)
    return () => setIsOpen(false)
  }, [])

  const handleSubmit = async (credentials: { host: string; token: string; siteId: string }) => {
    setLoading(true)
    try {
      // Store credentials in localStorage or session storage
      localStorage.setItem('tinybird_host', credentials.host)
      localStorage.setItem('tinybird_token', credentials.token)
      localStorage.setItem('site_id', credentials.siteId)
      
      // Refresh the page or navigate to dashboard
      router.refresh()
      setIsOpen(false)
    } catch (error) {
      console.error('Error saving credentials:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={() => undefined}>
      <Modal.Content>
        <Modal.Title id="credentials-title">Enter credentials</Modal.Title>
        <Modal.Description>
          To visualize your analytics data in the pre-built dashboard, you need
          to specify a token with read access to the pipes, and your workspace
          Host.
        </Modal.Description>
        <CredentialsForm onSubmit={handleSubmit} loading={loading} />
      </Modal.Content>
    </Modal>
  )
}
