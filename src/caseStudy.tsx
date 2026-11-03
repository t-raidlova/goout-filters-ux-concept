import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { CaseStudyPage } from './components/CaseStudyPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CaseStudyPage />
  </StrictMode>,
)
