import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export function useZoom(svgRef, gRef, deps = []) {
  const zoomRef = useRef(null)
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return
    const svg = d3.select(svgRef.current)
    const g = d3.select(gRef.current)
    const zoom = d3.zoom()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })
    svg.call(zoom)
    zoomRef.current = { svg, zoom }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const reset = () => {
    if (zoomRef.current) {
      zoomRef.current.svg.transition().duration(300).call(zoomRef.current.zoom.transform, d3.zoomIdentity)
    }
  }
  return { reset }
}
