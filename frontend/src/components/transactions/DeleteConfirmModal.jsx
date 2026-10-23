import React from 'react'
import { ConfirmDialog } from '../ConfirmDialog'
import '../../styles/components/DeleteConfirmModal.css'

export function DeleteConfirmModal(props) {
  return <ConfirmDialog {...props} />
}

export default DeleteConfirmModal
