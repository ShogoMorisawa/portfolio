import { createFileRoute } from '@tanstack/react-router';
import AdminEditor from '#/components/AdminEditor.tsx';

export const Route = createFileRoute('/admin/editor')({
  component: AdminEditorPage,
});

function AdminEditorPage() {
  return (
    <div>
      <AdminEditor />
    </div>
  );
}
