import { Suspense } from 'react'
import AdminEditor from '#/components/AdminEditor'

export default function AdminEditorPage() {
  return (
    <Suspense fallback={null}>
      <AdminEditor />
    </Suspense>
  )
}
