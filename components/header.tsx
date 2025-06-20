"use client"

import ThemeToggle from "./theme-toggle"

interface HeaderProps {
  role: "admin" | "guest"
  username: string
}

export function Header({ role, username }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">      
    <div className="flex flex-1 items-center gap-2">
        <h2 className="text-lg font-semibold">Sistem Manajemen Kerjasama DIA UPI</h2>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="flex items-center px-3 py-1 rounded-md bg-muted">
          <span className="text-sm font-medium capitalize">{role}</span>
        </div>
      </div>
    </header>
  )
}
