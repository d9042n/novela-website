import { BrowserRouter, Route, Routes } from 'react-router';
import './i18n';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './theme/ThemeProvider';
import { ReaderSettingsProvider } from './components/reader/ReaderSettingsContext';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './components/home/HomePage';
import { BrowsePage } from './components/browse/BrowsePage';
import { NovelDetailPage } from './components/detail/NovelDetailPage';
import { ReaderPage } from './components/reader/ReaderPage';
import { NotFoundPage } from './components/NotFoundPage';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ReaderSettingsProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="browse" element={<BrowsePage />} />
              <Route path="novel/:novelId" element={<NovelDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="novel/:novelId/chapter/:chapterIndex" element={<ReaderPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        </ReaderSettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
