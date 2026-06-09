# Daedalus

Daedalus is an agentic 3D world builder for Web3. It turns a natural-language brief for a hackathon, DAO, NFT gallery, or demo day into a validated and deployable Three.js world.

The project is designed for the Z.AI Track of the AI x Web3 Agentic Builders Hackathon. The core demo is not a static 3D hall: it shows a long-horizon agent workflow from requirement understanding to planning, scene specification, browser rendering, validation, repair, and delivery.

## MVP Goal

By 2026-06-11 noon, Daedalus should provide a runnable browser demo that can:

- Render a polished Web3 Demo Day 3D space.
- Accept a natural-language Web3 space brief.
- Produce a structured scene spec.
- Show an agent execution trace.
- Validate the generated scene against rules.
- Repair at least one planned issue.
- Export a submission package outline.

## Tech Stack

- Vite + React + TypeScript
- Three.js via React Three Fiber
- Drei for camera, text, and interaction helpers
- Zod for scene spec validation
- GLM-5.1 integration planned for the agent planner

## Current Status

This repository currently contains the product PRD and a lightweight frontend skeleton. See [docs/PRD.md](docs/PRD.md).

## Development

```bash
npm install
npm run dev
```
