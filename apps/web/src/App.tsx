import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import AboutPage from '@/pages/AboutPage';
import EditRecordPage from '@/pages/EditRecordPage';
import NewRecordPage from '@/pages/NewRecordPage';
import RecordDetailPage from '@/pages/RecordDetailPage';
import RecordsPage from '@/pages/RecordsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route element={<ProtectedRoute allow={true} />}>
          <Route index element={<RecordsPage />} />
          <Route path="records/new" element={<NewRecordPage />} />
          <Route path="records/:id" element={<RecordDetailPage />} />
          <Route path="records/:id/edit" element={<EditRecordPage />} />
        </Route>
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
