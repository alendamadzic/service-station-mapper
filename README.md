# Service Station Mapper

A modern web application for planning journeys and finding service stations along your route. Built with Next.js and featuring interactive maps, route planning, and real-time service station filtering.

## Features

- 🗺️ **Interactive Maps** - Visualize your route and nearby service stations using MapLibre GL
- 🧭 **Route Planning** - Calculate optimal routes between two locations
- ⛽ **Service Station Discovery** - Automatically find service stations within 5 miles of your route
- 🔍 **Location Search** - Geocoding-powered location input with autocomplete
- 📊 **Route Metrics** - View distance and estimated travel time
- 🎨 **Modern UI** - Beautiful, responsive interface built with shadcn/ui components
- 🌓 **Dark Mode** - Toggle between light and dark themes

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix Vega)
- **Maps**: [MapLibre GL](https://maplibre.org/)
- **Routing**: OSRM (Open Source Routing Machine)
- **Geocoding**: OpenStreetMap Nominatim API
- **Linting/Formatting**: [Biome](https://biomejs.dev/)
- **Package Manager**: [Bun](https://bun.sh/)

## Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or later)
- Node.js 18+ (if not using Bun)

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd service-station-mapper
```

2. Install dependencies:
```bash
bun install
```

3. Run the development server:
```bash
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `bun dev` - Start the development server
- `bun build` - Build the application for production
- `bun start` - Start the production server
- `bun lint` - Run Biome linter
- `bun lint:fix` - Run Biome linter and fix issues
- `bun format` - Format code with Biome

## Project Structure

```
service-station-mapper/
├── src/
│   ├── app/              # Next.js App Router pages and layouts
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utilities and services
│   │   ├── actions/     # Server actions
│   │   └── services/    # External service integrations
│   ├── types/           # TypeScript type definitions
│   ├── data/            # Static data files
│   └── hooks/           # Custom React hooks
├── public/              # Static assets
└── components.json      # shadcn/ui configuration
```

## How It Works

1. **Enter Locations**: Input your start and destination using the location search
2. **Calculate Route**: Click the "Route" button to calculate the optimal path
3. **View Stations**: Service stations within 5 miles of your route are automatically displayed
4. **Explore**: Click on stations in the list or map to see details

## Development

This project follows modern Next.js best practices:

- **App Router** - Uses the latest Next.js App Router architecture
- **Server Actions** - Route calculation and data fetching via server actions
- **Type Safety** - Full TypeScript coverage
- **Component Architecture** - Reusable, single-purpose components
- **Code Quality** - Biome for consistent code formatting and linting

## License

This project is private and proprietary.

## Author

[@alendamadzic](https://alen.world)
