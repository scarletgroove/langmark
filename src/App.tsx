import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PronunciationProvider } from './contexts/PronunciationContext'
import TopNav from './components/TopNav'
import Dashboard from './pages/Dashboard'
import Curriculum from './pages/Curriculum'
import Onboarding from './pages/Onboarding'
import LessonDetail from './pages/LessonDetail'
import Review from './pages/Review'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <PronunciationProvider>
        <div className="min-h-screen bg-[linear-gradient(135deg,_#f8f5ff_0%,_#fffcf5_100%)] text-gray-900">
          <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">
            <TopNav />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/curriculum" element={<Curriculum />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/lesson/:id" element={<LessonDetail />} />
              <Route path="/review" element={<Review />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </PronunciationProvider>
    </BrowserRouter>
  )
}

export default App
