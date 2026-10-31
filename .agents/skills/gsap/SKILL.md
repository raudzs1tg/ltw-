---
name: gsap
description: >-
  Use this skill when creating high-performance UI animations, page transitions,
  staggered product card reveals, interactive hover micro-interactions, number counters,
  and timeline sequences using GSAP (GreenSock Animation Platform) in React.
---

# GSAP Animation Skill for PTIT Tech Store

This skill provides standards and patterns for integrating **GSAP** (`gsap`) animations smoothly and safely across the React application.

## Core Architecture & Guidelines

1. **React Integration & Cleanup (`gsap.context`)**:
   - Always scope GSAP animations inside `gsap.context(() => { ... }, containerRef)` inside `useEffect` or `useLayoutEffect`.
   - Call `ctx.revert()` in the `useEffect` cleanup function so all tweens and inline transforms are cleanly reverted on unmount or page switch.

2. **Signature Animation Patterns**:
   - **Hero & Page Entrance Timeline (`gsap.timeline`)**:
     - Animate hero badges, headlines, CTA buttons, and countdown cards with `power3.out` and `stagger: 0.08`.
   - **Staggered Product Cards Reveal**:
     - Use `gsap.fromTo('.product-card', { opacity: 0, y: 28, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.05, ease: 'power2.out', clearProps: 'transform' })`.
   - **3D Tilt & Magnetic Hover Micro-interactions**:
     - Use `gsap.to(target, { rotateX, rotateY, scale: 1.03, duration: 0.25, ease: 'power2.out' })` on pointer movement and reset on `pointerleave`.
   - **Cart & Coin Counter Pulse**:
     - Pulse `.cart-badge` and `.coin-pill-btn` with `gsap.fromTo(..., { scale: 1.18 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' })` whenever items or coins change.

3. **Performance & Accessibility**:
   - Animate GPU-accelerated properties (`x`, `y`, `scale`, `rotation`, `opacity`).
   - Use `overwrite: 'auto'` to prevent conflicting tweens during rapid user interactions.
