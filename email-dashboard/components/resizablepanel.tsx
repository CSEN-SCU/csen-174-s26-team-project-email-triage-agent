"use client"
import { useState } from "react"

interface ResizablePanelProps {
  minWidth?: number
  maxWidth?: number
  initialWidth?: number
  children: React.ReactNode
}

export default function ResizablePanel({
  minWidth = 200,
  maxWidth = 500,
  initialWidth = 300,
  children
}: ResizablePanelProps) {
  const [width, setWidth] = useState(initialWidth)

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = width

    const onMouseMove = (e: MouseEvent) => {
      const delta = startX - e.clientX
      setWidth(Math.min(Math.max(startWidth + delta, minWidth), maxWidth))
    }

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }

  return (
    <div className="flex min-h-0 h-full min-w-0 shrink-0">
      <div
        className="h-full w-1 shrink-0 cursor-col-resize bg-gray-300"
        onMouseDown={startDrag}
      />
      <div className="h-full min-h-0 overflow-auto" style={{ width }}>
        {children}
      </div>
    </div>
  )
}