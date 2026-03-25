import React from "react"
import { AuthProvider } from "./contexts/AuthContext"
import { LanguageProvider } from "./contexts/LanguageContext"
import DashboardHUD from "./component/Dashboard/DashboardHUD.jsx"
import StartOverlay from "./component/StartOverlay.jsx"
import ParticlesBackground from "./component/ParticlesBackground.jsx"
import "./index.css"

export default function App() {
  return (
    <div className="bg-[#0b111a] min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <LanguageProvider>
        <AuthProvider>
          <StartOverlay />
          <DashboardHUD />
        </AuthProvider>
      </LanguageProvider>
    </div>
  )
}
