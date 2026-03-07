# Darker DB - Item Database

A complete GitHub Pages + GitHub Actions solution for the Darker DB item database. Automatically scrapes the API, stores the data, and serves an interactive web interface.

## 📋 Features

- **Complete API Scraping**: Fetches all items across all pages from the Darker DB API
- **Multiple Output Formats**: 
  - `all_items.json` - Complete item dataset
  - `items_page_*.json` - Individual page files (for version control)
  - `items_index.json` - Quick lookup index by item ID
  - `rarity_breakdown.json` - Statistical breakdown by rarity
  - `type_breakdown.json` - Statistical breakdown by item type
  - `metadata.json` - Scrape timestamp and statistics
- **Respectful Scraping**: Built-in delay between API requests (200ms)
- **Error Handling**: Graceful failure handling with detailed error messages
- **Progress Tracking**: Real-time feedback on scraping progress

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed on your system

### Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/darker-db-archive.git
cd darker-db-archive
```

2. No dependencies needed! The scraper uses only Node.js built-in modules.

### Running the Scraper

```bash
node scraper.js
```

The script will:
1. Create a `./data` directory
2. Fetch all pages from the API
3. Save individual page files
4. Generate compiled JSON files for easy access
5. Create metadata and breakdown files

### Output

After running, you'll have:
```
data/
├── all_items.json           # All ~2,400+ items in one file
├── items_page_001.json      # Page 1 raw API response
├── items_page_002.json      # Page 2 raw API response
├── ...
├── items_index.json         # Quick lookup: { itemId: { name, rarity, type, ... } }
├── metadata.json            # Scrape info and statistics
├── rarity_breakdown.json    # { "Common": 500, "Rare": 200, ... }
└── type_breakdown.json      # { "Armor": 1200, "Weapon": 800, ... }
```

## 📊 Example Data Structure

Each item includes:
```json
{
  "id": "AdventurerBoots_1001",
  "name": "Adventurer Boots",
  "rarity": "Poor",
  "type": "Armor",
  "description": "Hardy leather boots...",
  "gear_score": 1,
  "vendor_price": 0,
  "armor_rating": 23,
  "slot_type": "Foot",
  "experience": 1,
  ...
}
```

## 💾 Using the Data

### Load All Items
```javascript
const items = require('./data/all_items.json');
console.log(`Total items: ${items.length}`);
```

### Quick Lookup by ID
```javascript
const index = require('./data/items_index.json');
const item = index['AdventurerBoots_1001'];
```

### Get Statistics
```javascript
const rarities = require('./data/rarity_breakdown.json');
console.log(`Common items: ${rarities.Common}`);
```

## 🔧 Configuration

Edit the constants at the top of `scraper.js` to customize:

```javascript
const API_BASE = 'https://api.darkerdb.com/v1/items';
const OUTPUT_DIR = './data';
const DELAY = 200; // ms between requests
```

## ⚡ Performance

- Full scrape takes approximately 3-5 minutes depending on internet speed
- Respects the API with 200ms delay between requests
- File sizes:
  - `all_items.json`: ~80-100MB (uncompressed)
  - Individual page files: ~3-4MB each
  - Index file: ~15-20MB

## 📝 License

This project scrapes publicly available data from the Darker DB API. Please respect the game's terms of service.

## 🤝 Contributing

Found an issue or have suggestions? Feel free to submit a pull request!

## 📅 Last Updated

The data in this repository is static. Run the scraper yourself to get the latest data from the API.

---

**Note**: This is an archival tool for the Darker DB item database. For the latest game information, visit the official game website.
