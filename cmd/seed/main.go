package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/aaacellularphones/backend/internal/config"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type categorySeed struct {
	Name        string
	Slug        string
	Description string
	SortOrder   int
}

type spec struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type productSeed struct {
	Name         string
	Slug         string
	Description  string
	Price        float64
	ComparePrice *float64
	Stock        int
	CategorySlug string
	Images       []string
	Specs        []spec
}

func main() {
	cfg := config.Load()
	db, err := sqlx.Connect("postgres", cfg.DSN())
	if err != nil {
		log.Fatalf("failed to connect: %v", err)
	}
	defer db.Close()

	log.Println("connected to database, seeding...")

	// Disable audit triggers to avoid config issues during seed
	db.MustExec("ALTER TABLE products DISABLE TRIGGER trg_products_audit")
	db.MustExec("ALTER TABLE orders DISABLE TRIGGER trg_orders_audit")
	db.MustExec("ALTER TABLE payments DISABLE TRIGGER trg_payments_audit")
	db.MustExec("ALTER TABLE users DISABLE TRIGGER trg_users_audit")

	// Clear existing data (order matters for FK)
	db.MustExec("DELETE FROM reviews")
	db.MustExec("DELETE FROM order_items")
	db.MustExec("DELETE FROM payments")
	db.MustExec("DELETE FROM orders")
	db.MustExec("DELETE FROM products")
	db.MustExec("DELETE FROM categories")

	categories := []categorySeed{
		{Name: "Phones", Slug: "phones", Description: "Smartphones and mobile devices from top brands", SortOrder: 1},
		{Name: "Laptops", Slug: "laptops", Description: "Notebooks, ultrabooks and gaming laptops", SortOrder: 2},
		{Name: "Gaming Consoles", Slug: "gaming-consoles", Description: "Console gaming systems and handhelds", SortOrder: 3},
		{Name: "Tablets", Slug: "tablets", Description: "Tablets, iPads and 2-in-1 devices", SortOrder: 4},
		{Name: "Audio", Slug: "audio", Description: "Headphones, earbuds and speakers", SortOrder: 5},
		{Name: "Smart Home", Slug: "smart-home", Description: "Smartwatches, wearables and home devices", SortOrder: 6},
		{Name: "Cameras", Slug: "cameras", Description: "Digital cameras, DSLRs and action cams", SortOrder: 7},
		{Name: "Accessories", Slug: "accessories", Description: "Cables, chargers, cases and more", SortOrder: 8},
	}

	catIDs := make(map[string]string)
	for _, c := range categories {
		var id string
		err := db.QueryRow(
			`INSERT INTO categories (name, slug, description, sort_order, is_active, created_at, updated_at)
			 VALUES ($1, $2, $3, $4, true, NOW(), NOW()) RETURNING id`,
			c.Name, c.Slug, c.Description, c.SortOrder,
		).Scan(&id)
		if err != nil {
			log.Fatalf("failed to insert category %s: %v", c.Name, err)
		}
		catIDs[c.Slug] = id
		fmt.Printf("  category %s -> %s\n", c.Name, id)
	}

	cp := func(price float64) *float64 { return &price }

	products := []productSeed{
		// ---- Phones (8 products) ----
		{
			Name: "iPhone 16 Pro Max 256GB", Slug: "iphone-16-pro-max-256",
			Description: "The most powerful iPhone ever with A18 Pro chip, 48MP Fusion camera system, 5x optical zoom, titanium design, and all-day battery life. Features a stunning 6.9-inch Super Retina XDR display with ProMotion technology.",
			Price: 1199.99, ComparePrice: cp(1299.99), Stock: 25, CategorySlug: "phones",
			Images: []string{"seed_1.jpg", "seed_2.jpg", "seed_3.jpg"},
			Specs:  []spec{{"Chip", "A18 Pro"}, {"RAM", "8GB"}, {"Storage", "256GB"}, {"Display", "6.9\" Super Retina XDR"}, {"Camera", "48MP Fusion + 12MP Ultra Wide + 12MP Telephoto 5x"}, {"Battery", "4685 mAh"}, {"OS", "iOS 19"}},
		},
		{
			Name: "Samsung Galaxy S25 Ultra", Slug: "samsung-galaxy-s25-ultra",
			Description: "Samsung's flagship with Galaxy AI, 200MP camera system, built-in S Pen, and Snapdragon 8 Elite processor. Features a 6.9-inch Dynamic AMOLED 2X display with 120Hz refresh rate.",
			Price: 1299.99, ComparePrice: cp(1399.99), Stock: 30, CategorySlug: "phones",
			Images: []string{"seed_4.jpg", "seed_5.jpg"},
			Specs:  []spec{{"Chip", "Snapdragon 8 Elite"}, {"RAM", "12GB"}, {"Storage", "256GB"}, {"Display", "6.9\" Dynamic AMOLED 2X 120Hz"}, {"Camera", "200MP Wide + 50MP Ultra Wide + 10MP Telephoto 3x + 50MP Telephoto 5x"}, {"Battery", "5000 mAh"}, {"OS", "Android 15 / One UI 7"}},
		},
		{
			Name: "Google Pixel 9 Pro", Slug: "google-pixel-9-pro",
			Description: "Google's AI-first smartphone with Tensor G4 chip, 50MP camera with Super Res Zoom up to 30x, and 7 years of OS updates. Features a 6.7-inch LTPO OLED display.",
			Price: 999.99, ComparePrice: cp(1099.99), Stock: 20, CategorySlug: "phones",
			Images: []string{"seed_6.jpg", "seed_7.jpg"},
			Specs:  []spec{{"Chip", "Google Tensor G4"}, {"RAM", "16GB"}, {"Storage", "256GB"}, {"Display", "6.7\" LTPO OLED 120Hz"}, {"Camera", "50MP Wide + 48MP Ultra Wide + 48MP Telephoto 5x"}, {"Battery", "4700 mAh"}, {"OS", "Android 15"}},
		},
		{
			Name: "OnePlus 13", Slug: "oneplus-13",
			Description: "Flagship killer with Snapdragon 8 Elite, 50MP Hasselblad triple camera, 100W SUPERVOOC charging, and a 6.82-inch ProXDR display with 120Hz.",
			Price: 899.99, ComparePrice: cp(999.99), Stock: 35, CategorySlug: "phones",
			Images: []string{"seed_8.jpg", "seed_9.jpg"},
			Specs:  []spec{{"Chip", "Snapdragon 8 Elite"}, {"RAM", "12GB"}, {"Storage", "256GB"}, {"Display", "6.82\" ProXDR LTPO 120Hz"}, {"Camera", "50MP + 50MP Ultra Wide + 50MP Telephoto 3x"}, {"Battery", "6000 mAh"}, {"OS", "Android 15 / OxygenOS 15"}},
		},
		{
			Name: "iPhone 16 Pro 128GB", Slug: "iphone-16-pro-128",
			Description: "Pro power in a compact size. A18 Pro chip, 48MP camera system with 3x optical zoom, 6.3-inch Super Retina XDR display with ProMotion, and titanium design.",
			Price: 999.99, ComparePrice: cp(1099.99), Stock: 40, CategorySlug: "phones",
			Images: []string{"seed_10.jpg", "seed_11.jpg"},
			Specs:  []spec{{"Chip", "A18 Pro"}, {"RAM", "8GB"}, {"Storage", "128GB"}, {"Display", "6.3\" Super Retina XDR"}, {"Camera", "48MP Fusion + 12MP Ultra Wide + 12MP Telephoto 3x"}, {"Battery", "3582 mAh"}, {"OS", "iOS 19"}},
		},
		{
			Name: "Samsung Galaxy Z Fold 6", Slug: "samsung-galaxy-z-fold-6",
			Description: "The ultimate foldable experience with a 7.6-inch inner display, 6.3-inch cover screen, Snapdragon 8 Gen 3, and multitasking capabilities with Galaxy AI.",
			Price: 1899.99, ComparePrice: cp(1999.99), Stock: 10, CategorySlug: "phones",
			Images: []string{"seed_12.jpg", "seed_13.jpg", "seed_14.jpg"},
			Specs:  []spec{{"Chip", "Snapdragon 8 Gen 3"}, {"RAM", "12GB"}, {"Storage", "512GB"}, {"Display", "7.6\" Foldable Dynamic AMOLED 120Hz"}, {"Camera", "50MP Wide + 12MP Ultra Wide + 10MP Telephoto 3x"}, {"Battery", "4400 mAh"}, {"OS", "Android 15 / One UI 7"}},
		},
		{
			Name: "Xiaomi 14 Pro", Slug: "xiaomi-14-pro",
			Description: "Leica-powered flagship with Snapdragon 8 Gen 3, 50MP Leica triple camera, 120W HyperCharge, and a 6.73-inch 2K AMOLED display.",
			Price: 799.99, ComparePrice: cp(899.99), Stock: 22, CategorySlug: "phones",
			Images: []string{"seed_15.jpg", "seed_16.jpg"},
			Specs:  []spec{{"Chip", "Snapdragon 8 Gen 3"}, {"RAM", "12GB"}, {"Storage", "256GB"}, {"Display", "6.73\" 2K AMOLED LTPO 120Hz"}, {"Camera", "50MP Leica + 50MP Ultra Wide + 50MP Telephoto 3.2x"}, {"Battery", "4880 mAh"}, {"OS", "HyperOS / Android 15"}},
		},
		{
			Name: "Nothing Phone 3", Slug: "nothing-phone-3",
			Description: "Iconic transparent design with Glyph Interface, Snapdragon 8s Gen 3, 50MP dual camera, and Nothing OS with deep widget integration.",
			Price: 599.99, ComparePrice: cp(699.99), Stock: 28, CategorySlug: "phones",
			Images: []string{"seed_17.jpg", "seed_18.jpg"},
			Specs:  []spec{{"Chip", "Snapdragon 8s Gen 3"}, {"RAM", "12GB"}, {"Storage", "256GB"}, {"Display", "6.7\" LTPO OLED 120Hz"}, {"Camera", "50MP Wide + 50MP Ultra Wide"}, {"Battery", "5000 mAh"}, {"OS", "Nothing OS 3.0 / Android 15"}},
		},

		// ---- Laptops (6 products) ----
		{
			Name: "MacBook Pro 16\" M4 Pro", Slug: "macbook-pro-16-m4-pro",
			Description: "Apple's most powerful laptop with the M4 Pro chip featuring a 14-core CPU and 20-core GPU. 16.2-inch Liquid Retina XDR display, 36GB unified memory, and up to 22 hours of battery life.",
			Price: 2499.99, ComparePrice: cp(2699.99), Stock: 15, CategorySlug: "laptops",
			Images: []string{"seed_19.jpg", "seed_20.jpg", "seed_21.jpg"},
			Specs:  []spec{{"Chip", "Apple M4 Pro (14-core CPU, 20-core GPU)"}, {"RAM", "36GB Unified"}, {"Storage", "512GB SSD"}, {"Display", "16.2\" Liquid Retina XDR"}, {"Battery", "Up to 22 hours"}, {"Ports", "3x Thunderbolt 5, HDMI, SDXC, MagSafe 3"}, {"Weight", "2.14 kg"}},
		},
		{
			Name: "Dell XPS 15 (2025)", Slug: "dell-xps-15-2025",
			Description: "Premium ultrabook with Intel Core Ultra 9, NVIDIA GeForce RTX 5070, 15.6-inch 4K OLED InfinityEdge display, and a sleek machined aluminum chassis with minimalist design.",
			Price: 2199.99, ComparePrice: cp(2399.99), Stock: 18, CategorySlug: "laptops",
			Images: []string{"seed_22.jpg", "seed_23.jpg"},
			Specs:  []spec{{"Chip", "Intel Core Ultra 9 285H"}, {"RAM", "32GB LPDDR5X"}, {"Storage", "1TB NVMe SSD"}, {"Display", "15.6\" 4K OLED InfinityEdge"}, {"GPU", "NVIDIA GeForce RTX 5070 8GB"}, {"Battery", "86 Wh"}, {"Weight", "1.86 kg"}},
		},
		{
			Name: "Lenovo ThinkPad X1 Carbon Gen 12", Slug: "thinkpad-x1-carbon-gen12",
			Description: "The legendary business laptop reimagined. Intel Core Ultra 7, 16-inch 2.8K OLED display, MIL-STD-810H durability, and the best keyboard in the business.",
			Price: 1849.99, ComparePrice: cp(1999.99), Stock: 20, CategorySlug: "laptops",
			Images: []string{"seed_24.jpg", "seed_25.jpg"},
			Specs:  []spec{{"Chip", "Intel Core Ultra 7 265H"}, {"RAM", "32GB LPDDR5X"}, {"Storage", "512GB NVMe SSD"}, {"Display", "16\" 2.8K OLED"}, {"Battery", "57 Wh"}, {"Ports", "2x Thunderbolt 4, 2x USB-A, HDMI 2.1, 3.5mm"}, {"Weight", "1.08 kg"}},
		},
		{
			Name: "ASUS ROG Zephyrus G16", Slug: "asus-rog-zephyrus-g16",
			Description: "Ultra-slim gaming laptop with AMD Ryzen AI 9 HX 370, NVIDIA RTX 5080, 16-inch 2.5K 240Hz OLED display, and a premium CNC aluminum chassis with RGB lighting.",
			Price: 2799.99, ComparePrice: cp(2999.99), Stock: 12, CategorySlug: "laptops",
			Images: []string{"seed_1.jpg", "seed_4.jpg", "seed_7.jpg"},
			Specs:  []spec{{"Chip", "AMD Ryzen AI 9 HX 370"}, {"RAM", "32GB LPDDR5X"}, {"Storage", "1TB NVMe SSD"}, {"Display", "16\" 2.5K OLED 240Hz"}, {"GPU", "NVIDIA GeForce RTX 5080 16GB"}, {"Battery", "90 Wh"}, {"Weight", "1.85 kg"}},
		},
		{
			Name: "HP Spectre x360 16 (2025)", Slug: "hp-spectre-x360-16-2025",
			Description: "Convertible 2-in-1 with Intel Core Ultra 9, 16-inch 3K OLED touch display, 360-degree hinge, and stunning gem-cut design with quad speakers tuned by IMAX.",
			Price: 1699.99, ComparePrice: cp(1899.99), Stock: 14, CategorySlug: "laptops",
			Images: []string{"seed_10.jpg", "seed_13.jpg"},
			Specs:  []spec{{"Chip", "Intel Core Ultra 9 285H"}, {"RAM", "32GB LPDDR5X"}, {"Storage", "1TB NVMe SSD"}, {"Display", "16\" 3K OLED Touch"}, {"Battery", "83 Wh"}, {"Ports", "2x Thunderbolt 4, USB-A, HDMI 2.1, 3.5mm"}, {"Weight", "1.92 kg"}},
		},
		{
			Name: "Microsoft Surface Laptop 7", Slug: "microsoft-surface-laptop-7",
			Description: "Copilot+ PC with Snapdragon X Elite, 15-inch PixelSense Flow touch display, ultra-slim design with Alcantara palm rest, and all-day battery life with instant-on.",
			Price: 1499.99, ComparePrice: cp(1699.99), Stock: 16, CategorySlug: "laptops",
			Images: []string{"seed_16.jpg", "seed_19.jpg"},
			Specs:  []spec{{"Chip", "Snapdragon X Elite"}, {"RAM", "16GB LPDDR5X"}, {"Storage", "512GB NVMe SSD"}, {"Display", "15\" PixelSense Flow 120Hz Touch"}, {"Battery", "Up to 15 hours"}, {"Ports", "2x USB-C, USB-A, 3.5mm, Surface Connect"}, {"Weight", "1.66 kg"}},
		},

		// ---- Gaming Consoles (5 products) ----
		{
			Name: "PlayStation 5 Pro", Slug: "ps5-pro",
			Description: "Sony's most powerful console with upgraded GPU, ray tracing acceleration, PlayStation Spectral Super Resolution, 2TB SSD, and support for 8K output and 120fps gaming.",
			Price: 699.99, ComparePrice: cp(799.99), Stock: 20, CategorySlug: "gaming-consoles",
			Images: []string{"seed_22.jpg", "seed_24.jpg"},
			Specs:  []spec{{"CPU", "AMD Ryzen Zen 2 8-core (3.85GHz)"}, {"GPU", "RDNA 3.5 16.7 TFLOPS"}, {"RAM", "16GB GDDR6"}, {"Storage", "2TB NVMe SSD"}, {"Resolution", "Up to 8K / 120fps"}, {"Controller", "DualSense wireless"}, {"Dimensions", "388 x 89 x 260 mm"}},
		},
		{
			Name: "Xbox Series X", Slug: "xbox-series-x",
			Description: "Microsoft's flagship console with 12 TFLOPS GPU, 1TB SSD, Quick Resume, Xbox Game Pass integration, and full backward compatibility across four generations.",
			Price: 499.99, ComparePrice: cp(549.99), Stock: 25, CategorySlug: "gaming-consoles",
			Images: []string{"seed_2.jpg", "seed_5.jpg"},
			Specs:  []spec{{"CPU", "AMD Ryzen Zen 2 8-core (3.8GHz)"}, {"GPU", "RDNA 2 12 TFLOPS"}, {"RAM", "16GB GDDR6"}, {"Storage", "1TB NVMe SSD"}, {"Resolution", "Up to 4K / 120fps"}, {"Controller", "Xbox Wireless"}, {"Dimensions", "301 x 151 x 151 mm"}},
		},
		{
			Name: "Nintendo Switch 2", Slug: "nintendo-switch-2",
			Description: "The next generation of Nintendo gaming with a larger 8-inch display, improved Joy-Con controllers with magnetic attachment, DLSS support, and full backwards compatibility with Switch games.",
			Price: 449.99, ComparePrice: cp(499.99), Stock: 30, CategorySlug: "gaming-consoles",
			Images: []string{"seed_8.jpg", "seed_11.jpg"},
			Specs:  []spec{{"Chip", "Custom NVIDIA Tegra T239"}, {"RAM", "12GB LPDDR5"}, {"Storage", "256GB Internal"}, {"Display", "8\" LCD 1080p (4K via dock)"}, {"Battery", "Up to 6 hours"}, {"Controllers", "Magnetic Joy-Con 2"}, {"Weight", "380g (tablet only)"}},
		},
		{
			Name: "Steam Deck OLED 1TB", Slug: "steam-deck-oled-1tb",
			Description: "Valve's handheld gaming PC with a stunning 7.4-inch HDR OLED display, AMD APU with RDNA 3 graphics, 1TB NVMe SSD, and access to your entire Steam library on the go.",
			Price: 649.99, ComparePrice: cp(699.99), Stock: 18, CategorySlug: "gaming-consoles",
			Images: []string{"seed_14.jpg", "seed_17.jpg"},
			Specs:  []spec{{"APU", "AMD Zen 2 + RDNA 3"}, {"RAM", "16GB LPDDR5"}, {"Storage", "1TB NVMe SSD"}, {"Display", "7.4\" OLED HDR 90Hz"}, {"Battery", "50 Wh (up to 8 hours)"}, {"OS", "SteamOS 3.5"}, {"Weight", "640g"}},
		},
		{
			Name: "ASUS ROG Ally X", Slug: "asus-rog-ally-x",
			Description: "The ultimate Windows handheld gaming PC with AMD Ryzen Z2 Extreme, 8-inch 1080p 144Hz VRR display, 80Wh battery for extended gaming sessions, and 1TB SSD.",
			Price: 799.99, ComparePrice: cp(849.99), Stock: 15, CategorySlug: "gaming-consoles",
			Images: []string{"seed_20.jpg", "seed_23.jpg"},
			Specs:  []spec{{"APU", "AMD Ryzen Z2 Extreme RDNA 3.5"}, {"RAM", "24GB LPDDR5X"}, {"Storage", "1TB NVMe SSD"}, {"Display", "8\" 1080p 144Hz VRR"}, {"Battery", "80 Wh"}, {"OS", "Windows 11 Home"}, {"Weight", "678g"}},
		},

		// ---- Tablets (4 products) ----
		{
			Name: "iPad Pro M4 13\"", Slug: "ipad-pro-m4-13",
			Description: "Apple's thinnest and most powerful iPad ever with the M4 chip, Ultra Retina XDR display with tandem OLED, 10-core GPU, and Apple Pencil Pro support. The ultimate creative tool.",
			Price: 1299.99, ComparePrice: cp(1399.99), Stock: 22, CategorySlug: "tablets",
			Images: []string{"seed_25.jpg", "seed_3.jpg"},
			Specs:  []spec{{"Chip", "Apple M4 (10-core CPU, 10-core GPU)"}, {"RAM", "16GB Unified"}, {"Storage", "256GB"}, {"Display", "13\" Ultra Retina XDR (tandem OLED)"}, {"Camera", "12MP Wide + 12MP Ultra Wide"}, {"Battery", "Up to 10 hours"}, {"Weight", "579g (Wi-Fi)"}},
		},
		{
			Name: "Samsung Galaxy Tab S10 Ultra", Slug: "samsung-tab-s10-ultra",
			Description: "Samsung's premium Android tablet with a massive 14.6-inch Dynamic AMOLED 2X display, MediaTek Dimensity 9300+, S Pen included, and DeX mode for desktop-like productivity.",
			Price: 1199.99, ComparePrice: cp(1299.99), Stock: 16, CategorySlug: "tablets",
			Images: []string{"seed_6.jpg", "seed_9.jpg", "seed_12.jpg"},
			Specs:  []spec{{"Chip", "MediaTek Dimensity 9300+"}, {"RAM", "12GB"}, {"Storage", "256GB"}, {"Display", "14.6\" Dynamic AMOLED 2X 120Hz"}, {"Camera", "13MP + 8MP Ultra Wide"}, {"Battery", "11200 mAh"}, {"Weight", "718g"}},
		},
		{
			Name: "Microsoft Surface Pro 11", Slug: "surface-pro-11",
			Description: "The most powerful Surface Pro ever with Snapdragon X Elite, 13-inch PixelSense Flow 120Hz touch display, Copilot+ AI features, and versatile Kickstand for laptop-to-tablet versatility.",
			Price: 1499.99, ComparePrice: cp(1699.99), Stock: 14, CategorySlug: "tablets",
			Images: []string{"seed_15.jpg", "seed_18.jpg"},
			Specs:  []spec{{"Chip", "Snapdragon X Elite"}, {"RAM", "16GB LPDDR5X"}, {"Storage", "512GB NVMe SSD"}, {"Display", "13\" PixelSense Flow 120Hz Touch"}, {"Camera", "10MP rear + 1440p front"}, {"Battery", "Up to 14 hours"}, {"Weight", "895g"}},
		},
		{
			Name: "iPad Air M3 11\"", Slug: "ipad-air-m3-11",
			Description: "Powerful and affordable iPad with the M3 chip, 11-inch Liquid Retina display, support for Apple Pencil Pro, and ultra-portable design perfect for students and professionals.",
			Price: 599.99, ComparePrice: cp(699.99), Stock: 35, CategorySlug: "tablets",
			Images: []string{"seed_21.jpg", "seed_2.jpg"},
			Specs:  []spec{{"Chip", "Apple M3 (8-core CPU, 10-core GPU)"}, {"RAM", "8GB Unified"}, {"Storage", "128GB"}, {"Display", "11\" Liquid Retina"}, {"Camera", "12MP Wide"}, {"Battery", "Up to 10 hours"}, {"Weight", "462g (Wi-Fi)"}},
		},

		// ---- Audio (4 products) ----
		{
			Name: "AirPods Pro 3", Slug: "airpods-pro-3",
			Description: "Apple's premium earbuds with H3 chip, Adaptive Audio, active noise cancellation with transparency mode, personalized spatial audio, USB-C MagSafe charging case with Find My.",
			Price: 249.99, ComparePrice: cp(279.99), Stock: 50, CategorySlug: "audio",
			Images: []string{"seed_5.jpg", "seed_8.jpg"},
			Specs:  []spec{{"Chip", "Apple H3"}, {"Driver", "11mm custom"}, {"Noise Control", "ANC + Transparency + Adaptive"}, {"Audio", "Spatial Audio with Dynamic Head Tracking"}, {"Battery", "6h (30h with case)"}, {"Charging", "USB-C, MagSafe, Qi"}, {"Water Resistance", "IPX4"}},
		},
		{
			Name: "Sony WH-1000XM6", Slug: "sony-wh-1000xm6",
			Description: "Industry-leading noise canceling headphones with Sony's Integrated Processor V2, 30-hour battery life, Hi-Res Audio support, adaptive sound control, and ultra-comfortable design.",
			Price: 399.99, ComparePrice: cp(449.99), Stock: 30, CategorySlug: "audio",
			Images: []string{"seed_11.jpg", "seed_14.jpg"},
			Specs:  []spec{{"Driver", "30mm"}, {"Noise Control", "Industry-leading ANC with QN1e"}, {"Audio", "Hi-Res Audio, LDAC, DSEE Extreme"}, {"Battery", "30 hours (ANC on)"}, {"Charging", "USB-C (3min charge = 3h playback)"}, {"Weight", "254g"}, {"Foldable", "Yes"}},
		},
		{
			Name: "Bose QuietComfort Ultra", Slug: "bose-qc-ultra",
			Description: "Bose's best headphones with CustomTune ANC that adapts to your ear, Immersive Audio with head tracking, 24-hour battery life, and legendary Bose comfort for all-day wear.",
			Price: 429.99, ComparePrice: cp(479.99), Stock: 20, CategorySlug: "audio",
			Images: []string{"seed_17.jpg", "seed_20.jpg"},
			Specs:  []spec{{"Driver", "Custom Bose"}, {"Noise Control", "CustomTune ANC"}, {"Audio", "Bose Immersive Audio"}, {"Battery", "24 hours"}, {"Charging", "USB-C (15min = 2.5h playback)"}, {"Weight", "250g"}, {"Foldable", "Yes"}},
		},
		{
			Name: "Samsung Galaxy Buds 3 Pro", Slug: "samsung-buds-3-pro",
			Description: "Premium earbuds with blade-light design, 2-way speakers with planar tweeter, Galaxy AI features including Live Translate, adaptive ANC, and 360-degree audio.",
			Price: 249.99, ComparePrice: cp(279.99), Stock: 40, CategorySlug: "audio",
			Images: []string{"seed_23.jpg", "seed_1.jpg"},
			Specs:  []spec{{"Chip", "Samsung SoC"}, {"Driver", "10.5mm + Planar tweeter"}, {"Noise Control", "Adaptive ANC + Ambient"}, {"Audio", "360-degree Audio, 24-bit Hi-Fi"}, {"Battery", "6h (26h with case)"}, {"Charging", "USB-C, Wireless"}, {"Water Resistance", "IP57"}},
		},

		// ---- Smart Home (3 products) ----
		{
			Name: "Apple Watch Ultra 3", Slug: "apple-watch-ultra-3",
			Description: "The most rugged Apple Watch ever with a 49mm titanium case, precision dual-frequency GPS, Action button, 36-hour battery life, and advanced health features including sleep apnea detection.",
			Price: 799.99, ComparePrice: cp(849.99), Stock: 15, CategorySlug: "smart-home",
			Images: []string{"seed_4.jpg", "seed_7.jpg"},
			Specs:  []spec{{"Chip", "Apple S10 SiP"}, {"Display", "49mm sapphire crystal"}, {"Durability", "WR100, MIL-STD-810H"}, {"Battery", "Up to 36 hours (72h low power)"}, {"Sensors", "Heart rate, SpO2, Temperature, Depth"}, {"Connectivity", "LTE, Bluetooth 5.3, Wi-Fi, Precision GPS"}, {"Weight", "61g"}},
		},
		{
			Name: "Samsung Galaxy Watch 7 Ultra", Slug: "samsung-galaxy-watch-7-ultra",
			Description: "Premium smartwatch with Exynos W1000, titanium grade 4 case, rotating bezel, BioActive sensor with AGEs index, Galaxy AI wellness insights, and dual-frequency GPS.",
			Price: 649.99, ComparePrice: cp(699.99), Stock: 18, CategorySlug: "smart-home",
			Images: []string{"seed_10.jpg", "seed_13.jpg"},
			Specs:  []spec{{"Chip", "Exynos W1000"}, {"Display", "1.5\" Super AMOLED"}, {"Durability", "10ATM, IP68, MIL-STD-810H"}, {"Battery", "590 mAh (up to 60h)"}, {"Sensors", "BioActive, Temperature, Accelerometer, Gyro"}, {"Connectivity", "LTE, Bluetooth 5.3, Wi-Fi, Dual GPS"}, {"OS", "Wear OS 5 / One UI Watch 6"}},
		},
		{
			Name: "Ring Video Doorbell Pro 3", Slug: "ring-doorbell-pro-3",
			Description: "Premium video doorbell with 1536p HD+ resolution, 3D motion detection with bird's eye view, advanced pre-roll, dual-band Wi-Fi 6E, and Alexa integration for real-time monitoring.",
			Price: 229.99, ComparePrice: cp(249.99), Stock: 40, CategorySlug: "smart-home",
			Images: []string{"seed_16.jpg", "seed_19.jpg"},
			Specs:  []spec{{"Video", "1536p HD+ HDR"}, {"Field of View", "150° horizontal, 150° vertical"}, {"Motion Detection", "3D with Bird's Eye View"}, {"Connectivity", "Wi-Fi 6E dual-band"}, {"Audio", "Two-way with noise cancellation"}, {"Power", "Hardwired"}, {"Weather Resistance", "IP55"}},
		},

		// ---- Cameras (2 products) ----
		{
			Name: "Sony A7 V", Slug: "sony-a7-v",
			Description: "Sony's full-frame mirrorless flagship with 61MP sensor, AI-powered autofocus with real-time tracking, 8-stop IBIS, 8K video recording, and a 9.44M-dot EVF.",
			Price: 3499.99, ComparePrice: cp(3799.99), Stock: 8, CategorySlug: "cameras",
			Images: []string{"seed_22.jpg", "seed_25.jpg", "seed_3.jpg"},
			Specs:  []spec{{"Sensor", "61MP Full-Frame Exmor R CMOS"}, {"Processor", "BIONZ XR + AI Processing Unit"}, {"ISO Range", "50-102400"}, {"Video", "8K 30p / 4K 120p"}, {"IBIS", "8-stop 5-axis"}, {"EVF", "9.44M-dot OLED"}, {"Weight", "665g (body only)"}},
		},
		{
			Name: "GoPro Hero 13 Black", Slug: "gopro-hero-13-black",
			Description: "The most versatile action camera yet with 8K video, HyperSmooth 7.0 stabilization, GPS telemetry overlay, interchangeable lens system, and waterproof to 10m without housing.",
			Price: 449.99, ComparePrice: cp(499.99), Stock: 30, CategorySlug: "cameras",
			Images: []string{"seed_6.jpg", "seed_9.jpg"},
			Specs:  []spec{{"Sensor", "1/1.9\" CMOS"}, {"Video", "8K 30p / 4K 120p"}, {"Photo", "27MP"}, {"Stabilization", "HyperSmooth 7.0"}, {"Waterproof", "10m (without housing)"}, {"Battery", "1900 mAh Enduro"}, {"Weight", "154g"}},
		},

		// ---- Accessories (2 products) ----
		{
			Name: "Anker PowerCore 26800mAh", Slug: "anker-powercore-26800",
			Description: "Ultra-high capacity portable charger with 26800mAh, triple USB-A output, PowerIQ technology for optimized charging, and enough power to charge a phone 6+ times.",
			Price: 65.99, ComparePrice: cp(79.99), Stock: 60, CategorySlug: "accessories",
			Images: []string{"seed_12.jpg", "seed_15.jpg"},
			Specs:  []spec{{"Capacity", "26800 mAh"}, {"Output", "3x USB-A (6A total)"}, {"Input", "Micro USB"}, {"Technology", "PowerIQ"}, {"Charges", "iPhone ~6x, iPad ~2x"}, {"Dimensions", "180 x 80 x 23 mm"}, {"Weight", "595g"}},
		},
		{
			Name: "Belkin 3-in-1 MagSafe Charger", Slug: "belkin-3in1-magsafe",
			Description: "Apple's official 3-in-1 wireless charging dock for iPhone, Apple Watch, and AirPods. Certified MagSafe fast charging with 15W for iPhone and foldable design for travel.",
			Price: 149.99, ComparePrice: cp(169.99), Stock: 35, CategorySlug: "accessories",
			Images: []string{"seed_18.jpg", "seed_21.jpg"},
			Specs:  []spec{{"iPhone", "15W MagSafe (Qi2)"}, {"Apple Watch", "5W fast charging"}, {"AirPods", "5W Qi"}, {"Input", "USB-C"}, {"Material", "Premium silicone + polycarbonate"}, {"Foldable", "Yes"}, {"Includes", "40W USB-C power adapter"}},
		},
	}

	now := time.Now()
	for i, p := range products {
		catID := catIDs[p.CategorySlug]
		if catID == "" {
			log.Fatalf("unknown category slug: %s", p.CategorySlug)
		}

		images := pq.StringArray(p.Images)

		var productID string
		createdAt := now.Add(-time.Duration(len(products)-i) * time.Minute)
		err := db.QueryRow(
			`INSERT INTO products (name, slug, description, price, compare_price, stock, images, category_id, is_active, status, specifications, created_at, updated_at)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, 'active', $9::jsonb, $10, $10) RETURNING id`,
			p.Name, p.Slug, p.Description, p.Price, p.ComparePrice, p.Stock, images, catID, toJSON(p.Specs), createdAt,
		).Scan(&productID)
		if err != nil {
			log.Fatalf("failed to insert product %s: %v", p.Name, err)
		}
		fmt.Printf("  product %d: %s ($%.2f) [%s]\n", i+1, p.Name, p.Price, productID[:8])
	}

	// Re-enable triggers
	db.MustExec("ALTER TABLE products ENABLE TRIGGER trg_products_audit")
	db.MustExec("ALTER TABLE orders ENABLE TRIGGER trg_orders_audit")
	db.MustExec("ALTER TABLE payments ENABLE TRIGGER trg_payments_audit")
	db.MustExec("ALTER TABLE users ENABLE TRIGGER trg_users_audit")

	fmt.Println("\nseed complete!")
	fmt.Printf("  categories: %d\n", len(categories))
	fmt.Printf("  products: %d\n", len(products))
}

func toJSON(specs []spec) string {
	b, err := json.Marshal(specs)
	if err != nil {
		log.Fatalf("failed to marshal specs: %v", err)
	}
	return string(b)
}
