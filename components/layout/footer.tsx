import React from "react"
import { Github, X, Linkedin } from "lucide-react"

export const Footer = React.memo(function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted/30 border-t">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Bamboo Reports. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                v1.0.0
              </span>
              <span className="text-xs text-muted-foreground">|</span>
              <span className="text-xs text-muted-foreground">
                Research aNXT
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://github.com/abhishekrnxt/bamboo-reports-nextjs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted group"
                title="GitHub"
              >
                <Github className="h-4 w-4 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted group"
                title="Twitter"
              >
                <X className="h-4 w-4 text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted group"
                title="LinkedIn"
              >
                <Linkedin className="h-4 w-4 text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
})
