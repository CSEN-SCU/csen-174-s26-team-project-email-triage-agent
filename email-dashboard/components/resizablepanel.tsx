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
    <div className="flex">
      <div
        className="w-1 bg-gray-300 cursor-col-resize"
        onMouseDown={startDrag}
      />
      <div className="overflow-auto" style={{ width }}>{children}</div>
    </div>
  )
}