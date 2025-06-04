# MKPinja

A decentralized bookmarking service built on the Nostr protocol, inspired by Pinboard.in. MKPinja implements [NIP-B0](https://github.com/nostr-protocol/nips/blob/master/B0.md) for web bookmarking, giving users complete ownership and control over their bookmark data.

## Features

- **Decentralized Storage**: Bookmarks are stored on the Nostr network using NIP-B0
- **Complete Ownership**: Your data belongs to you, not a centralized service
- **Rich Organization**: Add titles, descriptions, and tags to organize your bookmarks
- **Search & Filter**: Powerful search and filtering capabilities
- **Quick Bookmarking**: Browser bookmarklet for one-click bookmark creation
- **Clean Interface**: Inspired by Pinboard's simple, efficient design
- **Dark Mode**: System-aware theme switching
- **Responsive Design**: Works great on desktop and mobile

## Technology Stack

- **React 18** with TypeScript
- **Nostr Protocol** via Nostrify
- **TailwindCSS** for styling
- **shadcn/ui** components
- **React Router** for navigation
- **TanStack Query** for data management
- **Vite** for fast development

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Nostr client extension (like Alby, nos2x, or similar)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mkpinja
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Usage

### Getting Started

1. **Connect Your Nostr Account**: Click the login button and connect your Nostr extension
2. **Add Your First Bookmark**: Use the "Add Bookmark" button or the bookmarklet
3. **Organize with Tags**: Add relevant tags to categorize your bookmarks
4. **Search & Filter**: Use the search bar and tag filters to find bookmarks quickly

### Bookmarklet Setup

1. Visit the `/bookmarklet` page in the app
2. Drag the "📌 MKPinja" button to your browser's bookmarks bar
3. Navigate to any webpage and click the bookmarklet to instantly bookmark it

### NIP-B0 Implementation

MKPinja follows the NIP-B0 specification for web bookmarking:

- **Kind 39701**: Addressable events for bookmarks
- **Required Tags**: 
  - `d`: URL without protocol (used as identifier)
- **Optional Tags**:
  - `title`: Bookmark title
  - `published_at`: First publication timestamp
  - `t`: Topic tags for categorization
- **Content**: Bookmark description
- **Deletable**: Supports NIP-09 deletion events

### Data Format

Each bookmark is stored as a Nostr event with the following structure:

```json
{
  "kind": 39701,
  "content": "Description of the bookmark",
  "tags": [
    ["d", "example.com/page"],
    ["title", "Page Title"],
    ["published_at", "1738863000"],
    ["t", "technology"],
    ["t", "programming"]
  ]
}
```

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── BookmarkForm.tsx
│   ├── BookmarkList.tsx
│   └── Layout.tsx
├── hooks/              # Custom React hooks
│   ├── useBookmarks.ts
│   └── useBookmarkPublish.ts
├── pages/              # Page components
│   ├── Index.tsx
│   ├── AddBookmark.tsx
│   ├── MyBookmarks.tsx
│   └── Bookmarklet.tsx
└── lib/                # Utility functions
```

### Key Hooks

- `useBookmarks(pubkey?)`: Fetch bookmarks for a user or globally
- `useBookmarkPublish()`: Create new bookmarks
- `useBookmarkDelete()`: Delete existing bookmarks
- `useCurrentUser()`: Get current logged-in user

### Testing

Run the test suite:

```bash
npm test
```

This runs TypeScript compilation, ESLint, Vitest tests, and builds the project.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Development

This project was video coded with [MKStack](https://soapbox.pub/blog/stacks/) - a modern development approach for building Nostr applications.

## Acknowledgments

- Inspired by [Pinboard.in](https://pinboard.in) for its clean, efficient design
- Built on the [Nostr protocol](https://nostr.com) for decentralization
- Implements [NIP-B0](https://github.com/nostr-protocol/nips/blob/master/B0.md) specification
- Uses [Nostrify](https://github.com/nostrify/nostrify) for Nostr integration

## Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Join the Nostr community for general protocol questions

---

**MKPinja** - Your bookmarks, your keys, your data. 🔖