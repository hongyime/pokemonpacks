# 🎴 Pokémon Pack Opener


![Project screenshot](./screenshot.png)


<div align="center">

  ![Pokémon Pack Opener](https://img.shields.io/badge/Pokémon-Pack_Opener-FF0000?style=for-the-badge&logo=pokemon&logoColor=white)
  ![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)

  **Experience the thrill of opening Pokémon card packs with stunning animations and intuitive swipe gestures!**

  [Live Demo](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## ✨ Features

### 🎮 Interactive Card Opening
- **Realistic Pack Opening**: Open packs of 8 random Pokémon cards
- **Swipe Mechanics**: Intuitive left/right swipe gestures powered by Hammer.js
- **Smooth Animations**: Beautiful GSAP-powered animations for card reveals and transitions
- **Keyboard Support**: Navigate with arrow keys for accessibility

### 🃏 Card Collection
- **Favorites System**: Swipe left to add cards to your personal collection
- **Collection Dashboard**: View all your favorited cards in a beautiful grid layout
- **Card Details**: Click any card to see detailed information
- **Export Functionality**: Download all favorites as a JSON backup, including card and image fields
- **Session Management**: Clear your session and start fresh

### 🎨 User Experience
- **Responsive Design**: Seamlessly works on mobile, tablet, and desktop
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Real-time Feedback**: Toast notifications for all actions
- **Loading States**: Clear feedback during API requests

### 🔌 API Integration
- **Pokémon TCG API**: Fetches authentic card data from official API
- **Smart Caching**: Session storage caching for faster load times
- **Rarity System**: Authentic pack distribution (Commons, Uncommons, Rares)
- **Standard Format**: Only uses cards legal in Standard format

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd pokemon-pack-opener

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🎯 How to Use

### Opening Packs
1. **Click "Open Pack"** on the home screen
2. **Wait for cards to load** (may take a moment due to API response times)
3. **View your pack** with a stunning opening animation

### Swiping Cards
- **Swipe Left (←)**: Add card to your favorites collection
- **Swipe Right (→)**: Skip to the next card
- **Arrow Keys**: Use keyboard for navigation
- **Touch/Mouse**: Drag cards in any direction

### Managing Your Collection
- **View Collection**: Click "Collection" in the navigation bar
- **Card Details**: Click any card to see full information
- **Export favorites**: Download the complete collection as JSON, including cards hidden by search filters
- **Clear Session**: Remove all favorites and start over

---

## 🛠️ Tech Stack

### Frontend Framework
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool

### Styling & Design
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Lucide React** - Crisp icon library
- **next-themes** - Dark mode support

### Animation & Gestures
- **GSAP** - Professional-grade animation library
- **Hammer.js** - Touch gesture recognition
- **Custom Animations** - Tailwind-based transitions

### Data & State
- **TanStack Query** - Powerful async state management
- **Axios** - Promise-based HTTP client
- **Session Storage** - Local data persistence

### API
- **Pokémon TCG API v2** - Official Pokémon card database
- API URL: `https://api.pokemontcg.io/v2`

---

## 📁 Project Structure

```
pokemon-pack-opener/
├── src/
│   ├── components/          # React components
│   │   ├── CardViewer.tsx   # Swipe card interface
│   │   ├── Dashboard.tsx    # Collection view
│   │   ├── PackOpening.tsx  # Pack reveal animation
│   │   ├── PokemonCard.tsx  # Individual card display
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/               # Custom React hooks
│   │   └── useSessionStorage.ts
│   ├── pages/               # Page components
│   │   ├── Index.tsx        # Main app page
│   │   └── NotFound.tsx     # 404 page
│   ├── services/            # API services
│   │   └── pokemonTcgApi.ts # TCG API integration
│   ├── types/               # TypeScript types
│   │   └── pokemon.ts       # Card data types
│   ├── lib/                 # Utilities
│   │   └── utils.ts         # Helper functions
│   ├── App.tsx              # App root
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
│   ├── pokeball.svg
│   ├── manifest.json
│   └── robots.txt
└── README.md                # You are here!
```

---

## 🎨 Features in Detail

### Pack Generation Algorithm
```
Standard Pack Composition:
├── 8 cards total
├── Variable distribution:
│   ├── 70% chance: 1 Rare card
│   ├── 1-3 Uncommon cards
│   └── Remaining slots: Common cards
└── No duplicates within a pack
```

### Rarity Distribution
- **Common**: Basic cards, most frequent
- **Uncommon**: Mid-tier cards
- **Rare**: Valuable cards
- **Ultra-Rare**: Extremely rare special cards

### Caching Strategy
- **Set Data**: Cached for 48 hours
- **Card Data**: Cached per rarity and set
- **Smart Invalidation**: Auto-clears expired cache
- **Session Storage**: Persists across page refreshes

---

## 🔧 Configuration

### API Key (Optional)
The Pokémon TCG API key is already configured in the code. The API key is a publishable key and provides higher rate limits.

### Environment Variables
No environment variables required - the app works out of the box!

---

## 📱 Responsive Breakpoints

```css
Mobile:  < 768px   (sm)
Tablet:  768px+    (md)
Desktop: 1024px+   (lg)
Large:   1280px+   (xl)
```

---

## 🎯 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` Left Arrow | Add to favorites |
| `→` Right Arrow | Skip card |

---

## 🚀 Build & Deploy

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to Lovable
1. Click the **"Publish"** button in the top right
2. Your app will be deployed to `yourapp.lovable.app`
3. Optional: Connect a custom domain in Project Settings

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

---

## 📝 License

This project is built with Lovable and uses the Pokémon TCG API.

### Credits
- **Pokémon TCG API**: https://pokemontcg.io/
- **Card Images**: © Pokémon Company International
- **Built with**: [Lovable](https://lovable.dev)

---

## 🐛 Known Issues & Limitations

- **API Response Times**: Pack opening may take up to 7 minutes due to API latency
- **Session Storage**: Favorites are cleared on browser restart
- **No Backend**: All data is stored locally in the browser
- **Rate Limiting**: API has rate limits (mitigated with caching)

---

## 🔮 Future Enhancements

- [ ] Add user authentication
- [ ] Persistent cloud storage
- [ ] Trading between users
- [ ] More pack types and sets
- [ ] Card statistics and analytics
- [ ] Deck builder functionality
- [ ] Social sharing features
- [ ] Achievement system

---

## 💖 Acknowledgments

Special thanks to:
- The Pokémon TCG API team
- The open-source community
- All contributors and users

---

<div align="center">

  **Built with ❤️ using Lovable**

  ⭐ Star this repo if you enjoyed it! ⭐

</div>

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

## Browser storage and API maintenance

The app keeps its existing sessionStorage/localStorage data and bundled catalogs.
When a write cannot persist, its new value remains available in memory for the
current page. Existing favorites, packs and unrelated entries are not evicted to
make room. A visible warning asks users to export favorites before reloading when
changes are temporary. Freeing space allows later writes to persist again.

In Faves, **Export favorites** downloads `pokemonpacks-favorites.json` with all
current favorites, including temporary changes and cards hidden by filters. The
file retains full card objects; there is no automatic cloud upload or in-app
import yet. **Remove All** asks for confirmation, changes only favorites through
the active storage backend, and leaves the current pack available without a reload.

The browser calls the Pokémon TCG API directly without an embedded credential or
development proxy. Each request has a 20-second timeout and accepts cancellation.
Anonymous requests have lower provider limits; the existing caches still apply.
The connection-check page makes one anonymous set request, cancels when you leave,
and reports availability without pretending to rewrite bundled CSV/JSON files.
Previously published credentials need retirement in the provider account; removing
them from current source does not revoke them or erase Git history.

The provider currently marks this API deprecated and says existing keys continue
through March 1, 2027. No paid replacement service has been enabled. See the
[authentication guidance](https://docs.pokemontcg.io/getting-started/authentication/)
and [rate limits](https://docs.pokemontcg.io/getting-started/rate-limits/).

Run the isolated storage regressions with `node --test tests/storage.test.mjs`
using Node 24 or later. Tests use synthetic in-memory storage and make no network
requests or changes to real browser collections. Storage repair does not establish
monthly Supabase or Vercel savings.

`bun install --frozen-lockfile --ignore-scripts` installs the existing lockfile;
`bun run build` checks both TypeScript projects before building. CI runs Node 24
storage tests and the same build, then `tests/browser.py` with Playwright 1.60.0.
The browser checks use disposable synthetic favorites and intercept provider
requests. They cover quota preservation, local fallback, backup contents, explicit
removal, reload/recovery and anonymous connection success/rate-limit/timeout flows.
To run locally, install that Playwright version and Chromium, then run
`python tests/browser.py` after building. The script owns and closes its temporary
local server. No real provider requests or user collections are used by the checks.
