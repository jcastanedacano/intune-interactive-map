import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

// Reusable D3 force simulation hook tuned for the spread-layout used by GraphView:
//   - Longer link distance + weaker pull → roomier graph
//   - Strong charge → categories repel each other naturally
//   - Hard collision matched to the 130×48 card size (diagonal ≈ 138 → 80 px radius)
//   - Optional category centroid force pulls same-category nodes softly together
//   - Slower alpha/velocity decay → simulation settles into a stable spread
export function useSimulation({
  nodes,
  links,
  width,
  height,
  charge = -600,
  linkDist = 180,
  linkStrength = 0.25,
  centerStrength = 0.04,
  collideRadius = 80,
  collideStrength = 1.0,
  categoryStrength = 0.015,
  alphaDecay = 0.015,
  velocityDecay = 0.35,
  onTick
}) {
  const simRef = useRef(null)

  useEffect(() => {
    if (!nodes.length) return
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(linkDist)
        .strength(linkStrength))
      .force('charge', d3.forceManyBody().strength(charge))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(centerStrength))
      .force('collide', d3.forceCollide().radius(collideRadius).strength(collideStrength))
      .force('category', () => {
        if (!categoryStrength) return
        const centroids = {}
        nodes.forEach(n => {
          if (!n.category) return
          if (!centroids[n.category]) centroids[n.category] = { x: 0, y: 0, count: 0 }
          centroids[n.category].x += n.x || 0
          centroids[n.category].y += n.y || 0
          centroids[n.category].count++
        })
        Object.values(centroids).forEach(c => { c.x /= c.count; c.y /= c.count })
        nodes.forEach(n => {
          const c = centroids[n.category]
          if (!c) return
          n.vx += (c.x - (n.x || 0)) * categoryStrength
          n.vy += (c.y - (n.y || 0)) * categoryStrength
        })
      })
      .alphaDecay(alphaDecay)
      .velocityDecay(velocityDecay)

    if (onTick) sim.on('tick', onTick)
    simRef.current = sim
    return () => sim.stop()
    // eslint-disable-next-line
  }, [nodes.length, links.length, width, height])

  return simRef
}
