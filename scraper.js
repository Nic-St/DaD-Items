#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://api.darkerdb.com/v1/items';
const OUTPUT_DIR = './data';
const DELAY = 200; // ms between requests to be respectful to the API

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper function to delay between requests
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch a single page from the API using native https
function fetchPage(pageNumber) {
    return new Promise((resolve, reject) => {
        const url = `${API_BASE}?page=${pageNumber}`;
        
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', chunk => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('Failed to parse JSON'));
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        }).on('error', reject);
    });
}

// Main scraping function
async function scrapeAllItems() {
    console.log('🔍 Starting API scrape...\n');
    
    let allItems = [];
    let currentPage = 1;
    let totalPages = 1;
    let totalItems = 0;
    
    try {
        while (currentPage <= totalPages) {
            try {
                console.log(`Fetching page ${currentPage}...`);
                const data = await fetchPage(currentPage);
                
                // Extract items from this page
                const items = data.body || [];
                allItems = allItems.concat(items);
                
                // Update pagination info
                if (data.pagination) {
                    totalPages = data.pagination.num_pages;
                    totalItems = data.pagination.total;
                    console.log(`✓ Page ${currentPage}/${totalPages} - Got ${items.length} items (Total: ${allItems.length}/${totalItems})`);
                }
                
                // Save this page to individual file
                const pageFileName = path.join(OUTPUT_DIR, `items_page_${String(currentPage).padStart(3, '0')}.json`);
                fs.writeFileSync(pageFileName, JSON.stringify(data, null, 2));
                console.log(`  Saved to: items_page_${String(currentPage).padStart(3, '0')}.json\n`);
                
                currentPage++;
                
                // Be respectful to the API - add delay between requests
                if (currentPage <= totalPages) {
                    await sleep(DELAY);
                }
            } catch (error) {
                console.error(`❌ Error fetching page ${currentPage}:`, error.message);
                console.log(`Stopping at page ${currentPage}`);
                break;
            }
        }
        
        console.log(`\n✅ Scraping complete!`);
        console.log(`Total items collected: ${allItems.length}`);
        
        // Save all items to a single file for easy access
        const allItemsFileName = path.join(OUTPUT_DIR, 'all_items.json');
        fs.writeFileSync(allItemsFileName, JSON.stringify(allItems, null, 2));
        console.log(`Saved all items to: all_items.json (${(fs.statSync(allItemsFileName).size / 1024 / 1024).toFixed(2)}MB)`);
        
        // Create a metadata file with summary information
        const metadata = {
            scraped_at: new Date().toISOString(),
            total_items: allItems.length,
            total_pages: currentPage - 1,
            api_endpoint: API_BASE,
            api_version: '1.0.7'
        };
        
        const metadataFileName = path.join(OUTPUT_DIR, 'metadata.json');
        fs.writeFileSync(metadataFileName, JSON.stringify(metadata, null, 2));
        console.log(`Saved metadata to: metadata.json`);
        
        // Create an index file for quick lookups
        const itemIndex = {};
        allItems.forEach(item => {
            itemIndex[item.id] = {
                name: item.name,
                rarity: item.rarity,
                type: item.type,
                description: item.description,
                gear_score: item.gear_score,
                vendor_price: item.vendor_price
            };
        });
        
        const indexFileName = path.join(OUTPUT_DIR, 'items_index.json');
        fs.writeFileSync(indexFileName, JSON.stringify(itemIndex, null, 2));
        console.log(`Saved item index to: items_index.json`);
        
        // Create a rarity breakdown
        const rarityBreakdown = {};
        const typeBreakdown = {};
        
        allItems.forEach(item => {
            if (!rarityBreakdown[item.rarity]) {
                rarityBreakdown[item.rarity] = 0;
            }
            rarityBreakdown[item.rarity]++;
            
            if (!typeBreakdown[item.type]) {
                typeBreakdown[item.type] = 0;
            }
            typeBreakdown[item.type]++;
        });
        
        const rarityFileName = path.join(OUTPUT_DIR, 'rarity_breakdown.json');
        fs.writeFileSync(rarityFileName, JSON.stringify(rarityBreakdown, null, 2));
        console.log(`Saved rarity breakdown to: rarity_breakdown.json`);
        
        const typeFileName = path.join(OUTPUT_DIR, 'type_breakdown.json');
        fs.writeFileSync(typeFileName, JSON.stringify(typeBreakdown, null, 2));
        console.log(`Saved type breakdown to: type_breakdown.json`);
        
        console.log('\n📦 All files saved to the ./data directory');
        console.log('✨ Ready for GitHub upload!\n');
        
        // Print summary
        console.log('📊 Summary:');
        console.log(`  Total Items: ${allItems.length}`);
        console.log(`  Total Pages: ${currentPage - 1}`);
        console.log(`  Rarities: ${Object.keys(rarityBreakdown).join(', ')}`);
        console.log(`  Types: ${Object.keys(typeBreakdown).join(', ')}`);
        
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

// Run the scraper
scrapeAllItems();
