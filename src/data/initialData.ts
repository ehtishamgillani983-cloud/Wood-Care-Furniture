import { Category, Subcategory, Product, GalleryItem, Service, Review, BlogPost, FAQ, SiteSettings, VideoItem } from '../types';

export const initialSettings: SiteSettings = {
  brand_name: "Wood Care Furniture",
  tagline: "Premium Furniture Manufacturer & Wholesaler",
  logo_url: "/wood_care_logo.svg",
  favicon_url: "/wood_care_logo.svg",
  phone: "+92 332 5099930",
  whatsapp: "+92 332 5099930",
  email: "imranshah1984@gmail.com",
  address: "M33J+C6H, Shamsabad, Rawalpindi, Pakistan",
  postal_code: "46000",
  opening_hours: "9:00 AM – 9:00 PM (Mon – Sun)",
  instagram_url: "https://www.instagram.com/wood_care_furniture/",
  facebook_url: "https://www.facebook.com/share/1DvHhN2692/",
  google_maps_url: "https://maps.google.com/?q=Shamsabad+Rawalpindi+Wood+Care+Furniture",
  hero_heading: "Furniture Designed for Beautiful Living",
  hero_subheading: "Premium handcrafted furniture for homes, offices and commercial spaces across Rawalpindi and Islamabad.",
  hero_media_url: "/images/hero_luxury_living_1791186963111.jpg",
  hero_video_url: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  hero_video_overlay: 0.38,
  hero_videos: [
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1",
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1920&q=80"
  ],
  hero_images: [
    "/images/hero_luxury_living_1791186963111.jpg",
    "/images/cat_living_room_1791186977406.jpg",
    "/images/cat_bedroom_1791186990246.jpg",
    "/images/cat_dining_1791187001317.jpg",
    "/images/cat_custom_chair_1791187012133.jpg"
  ],
  hero_cta_text: "Explore Furniture",
  hero_cta_link: "/furniture",
  footer_description: "Wood Care Furniture is a premier furniture manufacturer and wholesaler based in Shamsabad, Rawalpindi. We build bespoke living, bedroom, dining, and custom pieces with generational woodworking craftsmanship.",
  copyright_text: "© 2026 Wood Care Furniture. All rights reserved.",
  seo_title: "Wood Care Furniture | Luxury Solid Wood Furniture in Rawalpindi & Islamabad",
  seo_description: "Premier furniture manufacturer and wholesaler in Rawalpindi & Islamabad. Specializing in bespoke sofas, solid wood beds, luxury dining tables, and custom architectural woodwork.",
  seo_keywords: "wood care furniture, furniture in Rawalpindi, furniture showroom Rawalpindi, furniture shop Rawalpindi, furniture in Islamabad, wooden furniture Rawalpindi, custom sofa Rawalpindi, solid sheesham bed Pakistan"
};

export const initialCategories: Category[] = [
  {
    id: "living-room",
    name: "Living Room",
    slug: "living-room",
    description: "Curated sofas, sculpted coffee tables, TV media consoles, and luxury accent seating.",
    image: "/images/cat_living_room_1791186977406.jpg",
    order_index: 1,
    is_active: true,
    is_featured: true,
    seo_title: "Living Room Furniture Rawalpindi | Luxury Sofas & Consoles",
    seo_description: "Explore handcrafted solid wood living room furniture in Rawalpindi & Islamabad. Custom sofas, L-shape lounges, and coffee tables."
  },
  {
    id: "bedroom",
    name: "Bedroom",
    slug: "bedroom",
    description: "Master bed suites, floating nightstands, solid wood wardrobes, and vanity dressers.",
    image: "/images/cat_bedroom_1791186990246.jpg",
    order_index: 2,
    is_active: true,
    is_featured: true,
    seo_title: "Bedroom Furniture Rawalpindi | Solid Wood Beds & Nightstands",
    seo_description: "Handcrafted master bed sets in seasoned Sheesham and Teak wood. Custom sizes and finishes available at our Rawalpindi showroom."
  },
  {
    id: "dining",
    name: "Dining",
    slug: "dining",
    description: "Grand solid wood dining tables, ergonomic dining chairs, and buffet sideboards.",
    image: "/images/cat_dining_1791187001317.jpg",
    order_index: 3,
    is_active: true,
    is_featured: true,
    seo_title: "Dining Sets & Tables Rawalpindi | Woodgear Furniture",
    seo_description: "Discover 6, 8, and 10-seater handcrafted solid wood dining tables and matching chairs in Rawalpindi."
  },
  {
    id: "custom-furniture",
    name: "Custom Furniture",
    slug: "custom-furniture",
    description: "Bespoke architectural woodworking, customized luxury sofas, and sculptural focal pieces.",
    image: "/images/cat_custom_chair_1791187012133.jpg",
    order_index: 4,
    is_active: true,
    is_featured: true,
    seo_title: "Custom Furniture Manufacturer Rawalpindi & Islamabad",
    seo_description: "Bring your design drawings or custom furniture ideas to life. In-house seasoned wood crafting with direct WhatsApp consultation."
  },
  {
    id: "office",
    name: "Office",
    slug: "office",
    description: "Executive desks, conference tables, ergonomic work chairs, and credenzas.",
    image: "/images/hero_luxury_living_1791186963111.jpg",
    order_index: 5,
    is_active: true,
    is_featured: true,
    seo_title: "Office Furniture Rawalpindi | Executive Desks & Conference Tables",
    seo_description: "Commercial and home office furniture for businesses across Rawalpindi and Islamabad."
  },
  {
    id: "outdoor",
    name: "Outdoor",
    slug: "outdoor",
    description: "Weather-treated teak patio lounges, garden dining tables, and veranda chairs.",
    image: "/images/cat_dining_1791187001317.jpg",
    order_index: 6,
    is_active: true,
    is_featured: false,
    seo_title: "Outdoor & Patio Furniture Rawalpindi",
    seo_description: "Weather-treated outdoor furniture made with seasoned woods and durable outdoor fabrics."
  },
  {
    id: "kids",
    name: "Kids",
    slug: "kids",
    description: "Solid wood study desks, bunk beds, and child-safe organization units.",
    image: "/images/cat_bedroom_1791186990246.jpg",
    order_index: 7,
    is_active: true,
    is_featured: false,
    seo_title: "Kids Bedroom & Study Furniture",
    seo_description: "Safe, durable solid wood study tables and beds crafted for children's bedrooms."
  }
];

export const initialSubcategories: Subcategory[] = [
  // Living Room
  { id: "sub-lr-1", category_id: "living-room", name: "Sofas & Sofa Sets", slug: "sofas", order_index: 1, is_active: true },
  { id: "sub-lr-2", category_id: "living-room", name: "L Shape Sectionals", slug: "l-shape-sofas", order_index: 2, is_active: true },
  { id: "sub-lr-3", category_id: "living-room", name: "Coffee Tables", slug: "coffee-tables", order_index: 3, is_active: true },
  { id: "sub-lr-4", category_id: "living-room", name: "Side & End Tables", slug: "side-tables", order_index: 4, is_active: true },
  { id: "sub-lr-5", category_id: "living-room", name: "TV Media Units", slug: "tv-units", order_index: 5, is_active: true },
  { id: "sub-lr-6", category_id: "living-room", name: "Consoles & Credenzas", slug: "consoles", order_index: 6, is_active: true },

  // Bedroom
  { id: "sub-bd-1", category_id: "bedroom", name: "Beds & Bed Sets", slug: "beds", order_index: 1, is_active: true },
  { id: "sub-bd-2", category_id: "bedroom", name: "Bedside Tables", slug: "bedside-tables", order_index: 2, is_active: true },
  { id: "sub-bd-3", category_id: "bedroom", name: "Dressing Tables", slug: "dressing-tables", order_index: 3, is_active: true },
  { id: "sub-bd-4", category_id: "bedroom", name: "Wardrobes & Armoires", slug: "wardrobes", order_index: 4, is_active: true },
  { id: "sub-bd-5", category_id: "bedroom", name: "Chest of Drawers", slug: "chest-of-drawers", order_index: 5, is_active: true },

  // Dining
  { id: "sub-dn-1", category_id: "dining", name: "Dining Tables", slug: "dining-tables", order_index: 1, is_active: true },
  { id: "sub-dn-2", category_id: "dining", name: "Dining Chairs", slug: "dining-chairs", order_index: 2, is_active: true },
  { id: "sub-dn-3", category_id: "dining", name: "Complete Dining Sets", slug: "dining-sets", order_index: 3, is_active: true },
  { id: "sub-dn-4", category_id: "dining", name: "Buffets & Sideboards", slug: "buffets", order_index: 4, is_active: true },

  // Office
  { id: "sub-of-1", category_id: "office", name: "Executive Desks", slug: "executive-desks", order_index: 1, is_active: true },
  { id: "sub-of-2", category_id: "office", name: "Conference Tables", slug: "conference-tables", order_index: 2, is_active: true },
  { id: "sub-of-3", category_id: "office", name: "Office Seating", slug: "office-chairs", order_index: 3, is_active: true },
  { id: "sub-of-4", category_id: "office", name: "File Cabinets & Bookshelves", slug: "office-storage", order_index: 4, is_active: true },

  // Custom
  { id: "sub-cs-1", category_id: "custom-furniture", name: "Bespoke Accent Chairs", slug: "bespoke-chairs", order_index: 1, is_active: true },
  { id: "sub-cs-2", category_id: "custom-furniture", name: "Custom Sofa Manufacturing", slug: "custom-sofas", order_index: 2, is_active: true },
  { id: "sub-cs-3", category_id: "custom-furniture", name: "Architectural Woodwork", slug: "architectural-woodwork", order_index: 3, is_active: true }
];

export const initialProducts: Product[] = [
  {
    id: "prod-arch-rocker",
    name: "The Sculptural Arch Rocking Lounge Chair",
    slug: "sculptural-arch-rocking-chair",
    category_id: "custom-furniture",
    subcategory_id: "sub-cs-1",
    main_image: "/images/cat_custom_chair_1791187012133.jpg",
    images: [
      "/images/cat_custom_chair_1791187012133.jpg",
      "/images/hero_luxury_living_1791186963111.jpg"
    ],
    description: "Our signature handcrafted showpiece. Features a continuous cantilevered arch of steam-bent seasoned walnut, an integrated reading luminaire canopy, and an ergonomic plush emerald green upholstered seat pad. Hand-sanded and hand-rubbed with organic matte oil finish for lasting silky touch.",
    short_description: "Signature steam-bent solid walnut rocking lounge chair with integrated ambient reading arch and emerald green cushion.",
    material: "Solid Seasoned American Walnut / High-density foam / Textured emerald linen-velvet",
    dimensions: "W 92 cm × D 118 cm × H 135 cm (Seat Height: 44 cm)",
    finish: "Natural Matte Walnut Oil Finish",
    availability: "made_to_order",
    customizable: true,
    featured: true,
    is_new: true,
    is_bestseller: true,
    tags: ["Signature Design", "Sculptural", "Solid Walnut", "Custom Accent"],
    price: null,
    price_visible: false,
    quote_only: true,
    seo_title: "Sculptural Arch Rocking Chair Rawalpindi | Wood Care Furniture",
    seo_description: "Signature solid walnut sculptural rocking chair handcrafted in Rawalpindi. Contact for customized upholstery and dimensions."
  },
  {
    id: "prod-curved-boucle-sofa",
    name: "The Shamsabad Grand Curved Sectional",
    slug: "shamsabad-grand-curved-sectional",
    category_id: "living-room",
    subcategory_id: "sub-lr-1",
    main_image: "/images/hero_luxury_living_1791186963111.jpg",
    images: [
      "/images/hero_luxury_living_1791186963111.jpg",
      "/images/cat_living_room_1791186977406.jpg"
    ],
    description: "An editorial statement sofa designed for spacious modern drawing rooms and luxury lounges. Built on an internal kiln-dried Sheesham hardwood frame with multi-density Molty resilient foam cushioning and imported heavy cream bouclé fabric. Available in custom seating configurations.",
    short_description: "Architectural curved sectional sofa upholstered in premium textured cream bouclé on seasoned hardwood frame.",
    material: "Kiln-dried Sheesham internal frame / Molty Master foam / Premium Turkish Bouclé",
    dimensions: "L 340 cm × D 160 cm × H 78 cm (Customizable)",
    finish: "Muted Ivory / Concealed Walnut Base Plinth",
    availability: "made_to_order",
    customizable: true,
    featured: true,
    is_new: false,
    is_bestseller: true,
    tags: ["Living Room", "Curved Sofa", "Bouclé", "Custom Seating"],
    price: null,
    price_visible: false,
    quote_only: true,
    seo_title: "Curved Bouclé Sectional Sofa Rawalpindi & Islamabad",
    seo_description: "Bespoke curved luxury sofa made to measure by Wood Care Furniture in Rawalpindi. Inquire on WhatsApp for swatches."
  },
  {
    id: "prod-sol-walnut-bed",
    name: "Elysian Solid Sheesham Master Bed Suite",
    slug: "elysian-solid-sheesham-bed-suite",
    category_id: "bedroom",
    subcategory_id: "sub-bd-1",
    main_image: "/images/cat_bedroom_1791186990246.jpg",
    images: [
      "/images/cat_bedroom_1791186990246.jpg"
    ],
    description: "Timeless warmth meets modern minimalism. The Elysian Bed is constructed from 100% seasoned, termite-proof solid Sheesham (Indian Rosewood) with floating acoustic headboard panels and matching cantilevered nightstands. Hand-buffed lacquer finish highlights the rich grain patterns.",
    short_description: "King-size solid Sheesham wood bed with integrated architectural headboard and twin floating side tables.",
    material: "100% Solid Seasoned Sheesham Wood (Tahli) / Brass trim joinery",
    dimensions: "King Size (Mattress size 72\" × 78\" / Total Headboard Width 108\")",
    finish: "Warm Walnut Stain with Matte Protective Polyurethane",
    availability: "in_stock",
    customizable: true,
    featured: true,
    is_new: false,
    is_bestseller: true,
    tags: ["Solid Sheesham", "Master Bed", "King Size", "Bedroom Suite"],
    price: null,
    price_visible: false,
    quote_only: true,
    seo_title: "Solid Sheesham King Bed Rawalpindi | Wood Care Furniture",
    seo_description: "Handcrafted solid Sheesham bed set with nightstands in Rawalpindi. Termite-proof guaranteed seasoned wood."
  },
  {
    id: "prod-monolith-dining-set",
    name: "Monolith 8-Seater Solid Wood Dining Suite",
    slug: "monolith-8-seater-dining-suite",
    category_id: "dining",
    subcategory_id: "sub-dn-3",
    main_image: "/images/cat_dining_1791187001317.jpg",
    images: [
      "/images/cat_dining_1791187001317.jpg"
    ],
    description: "Designed for grand family dinners and sophisticated gatherings. Features an expansive 2-inch thick solid edge table top with tapered pedestal trestle bases and 8 sculpted ergonomic dining chairs wrapped in stain-resistant textured fabric.",
    short_description: "8-seater solid hardwood dining table accompanied by 8 sculpted chairs in neutral upholstery.",
    material: "Solid Teak & Seasoned Sheesham / Water-repellent upholstery",
    dimensions: "Table: 240 cm × 105 cm × 76 cm / Chairs: 50 cm × 55 cm × 88 cm",
    finish: "Natural Satin Woodgrain Finish",
    availability: "made_to_order",
    customizable: true,
    featured: true,
    is_new: true,
    is_bestseller: false,
    tags: ["Dining Set", "8 Seater", "Solid Wood", "Family Table"],
    price: null,
    price_visible: false,
    quote_only: true,
    seo_title: "8-Seater Wooden Dining Table Rawalpindi | Wood Care Furniture",
    seo_description: "Solid wood 8-seater dining table set manufactured in Rawalpindi. Inquire on WhatsApp for custom 6 or 10-seater sizes."
  },
  {
    id: "prod-sculpted-lounge-sectional",
    name: "The Rawalpindi Minimalist L-Shape Lounge",
    slug: "rawalpindi-minimalist-l-shape-lounge",
    category_id: "living-room",
    subcategory_id: "sub-lr-2",
    main_image: "/images/cat_living_room_1791186977406.jpg",
    images: [
      "/images/cat_living_room_1791186977406.jpg"
    ],
    description: "Deep, comfortable seating designed with low-profile European proportions. The chaise can be customized for left or right orientation. High-resilience Molty pocket-spring seat core wrapped in feather-down alternative for cloud-like comfort.",
    short_description: "Contemporary low-profile L-shape sectional with feather-touch back cushions and natural wooden plinth.",
    material: "Hardwood base / High-density hybrid foam / Premium textured linen blend",
    dimensions: "310 cm × 190 cm (Chaise depth) × 74 cm Height",
    finish: "Warm Sand / Natural Teak Plinth",
    availability: "made_to_order",
    customizable: true,
    featured: true,
    is_new: false,
    is_bestseller: true,
    tags: ["L Shape", "Sectional", "Lounge", "Custom Fabric"],
    price: null,
    price_visible: false,
    quote_only: true,
    seo_title: "L-Shape Sofa Rawalpindi | Custom Made Sectional Lounges",
    seo_description: "Custom-sized L-shape sofas in Rawalpindi and Islamabad. Inquire on WhatsApp to choose from 50+ fabric shades."
  },
  {
    id: "prod-executive-presidential-desk",
    name: "The Sovereign Executive Teak Office Suite",
    slug: "sovereign-executive-office-desk",
    category_id: "office",
    subcategory_id: "sub-of-1",
    main_image: "/images/hero_luxury_living_1791186963111.jpg",
    images: [
      "/images/hero_luxury_living_1791186963111.jpg"
    ],
    description: "Built for company directors and home studies that demand dignity. Includes integrated wire management conduits, soft-close dovetailed drawers, lockable security safe compartment, and an optional matching credenza sideboard.",
    short_description: "Commanding solid teak executive desk with leather blotter inlay and soft-closing storage modules.",
    material: "Seasoned Teak Wood / Full-grain leather writing insert / Antique brass hardware",
    dimensions: "210 cm × 95 cm × 77 cm",
    finish: "Rich Dark Tobacco Teak Polish",
    availability: "made_to_order",
    customizable: true,
    featured: false,
    is_new: false,
    is_bestseller: false,
    tags: ["Office", "Executive Desk", "Teak Wood", "Commercial"],
    price: null,
    price_visible: false,
    quote_only: true,
    seo_title: "Executive Office Table Rawalpindi & Islamabad",
    seo_description: "Custom executive office desks for corporate suites and executive studies in Islamabad & Rawalpindi."
  }
];

export const initialGalleryItems: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Presidential Residence Drawing Room",
    description: "Curved bouclé sectional paired with handcrafted live-edge walnut coffee tables in an Islamabad residence.",
    image: "/images/hero_luxury_living_1791186963111.jpg",
    category_name: "Living Spaces",
    featured: true,
    order_index: 1,
    is_active: true,
    aspect_ratio: "wide"
  },
  {
    id: "gal-2",
    title: "The Arch Sculptural Rocking Chair",
    description: "Steam-bent continuous arch custom chair finished in hand-rubbed Danish oil with emerald velvet pad.",
    image: "/images/cat_custom_chair_1791187012133.jpg",
    category_name: "Bespoke Woodwork",
    featured: true,
    order_index: 2,
    is_active: true,
    aspect_ratio: "square"
  },
  {
    id: "gal-3",
    title: "Master Suite in Solid Sheesham",
    description: "Floating king bed frame with architectural vertical wood slats and integrated nightstand reading lights.",
    image: "/images/cat_bedroom_1791186990246.jpg",
    category_name: "Bedroom Sanctuary",
    featured: true,
    order_index: 3,
    is_active: true,
    aspect_ratio: "tall"
  },
  {
    id: "gal-4",
    title: "Banquet Dining Space Installation",
    description: "Solid hardwood 8-seater dining table with natural timber grain under warm ambient lighting.",
    image: "/images/cat_dining_1791187001317.jpg",
    category_name: "Dining Suites",
    featured: true,
    order_index: 4,
    is_active: true,
    aspect_ratio: "standard"
  },
  {
    id: "gal-5",
    title: "Shamsabad Showroom Display Floor",
    description: "A glimpse of curated furniture vignettes ready for customer inspection at our Shamsabad workshop & showroom.",
    image: "/images/cat_living_room_1791186977406.jpg",
    category_name: "Showroom Display",
    featured: true,
    order_index: 5,
    is_active: true,
    aspect_ratio: "standard"
  }
];

export const initialServices: Service[] = [
  {
    id: "serv-custom-mfg",
    title: "Bespoke Furniture Manufacturing",
    slug: "bespoke-manufacturing",
    description: "We bring architects', interior designers', and homeowners' custom furniture sketches to life using seasoned Sheesham, Teak, and American Walnut.",
    image: "/images/cat_custom_chair_1791187012133.jpg",
    order_index: 1,
    is_active: true,
    details: [
      "Precise 3D and dimension consultation",
      "Termite-proof kiln-seasoned hardwoods",
      "Over 120+ fabric, leatherette & bouclé choices",
      "Progress photos during factory production"
    ]
  },
  {
    id: "serv-custom-sofas",
    title: "Custom Sofa Manufacturing",
    slug: "custom-sofa-manufacturing",
    description: "From curved statement bouclé sectionals to classical tufted Chesterfield sets, every sofa is built on solid internal hardwood frames with high-density foam guarantees.",
    image: "/images/hero_luxury_living_1791186963111.jpg",
    order_index: 2,
    is_active: true,
    details: [
      "Custom length, depth, and L-shape orientations",
      "Molty Master foam / pocket spring options",
      "Stain-resistant and pet-friendly upholstery",
      "Double-stitched premium craftsmanship"
    ]
  },
  {
    id: "serv-wholesale",
    title: "Furniture Wholesale & Commercial Fitouts",
    slug: "furniture-wholesale",
    description: "Supplying bulk furniture solutions to hotels, corporate offices, executive suites, and boutique retailers throughout the twin cities and Punjab.",
    image: "/images/cat_dining_1791187001317.jpg",
    order_index: 3,
    is_active: true,
    details: [
      "Direct factory pricing with wholesale margins",
      "Turnkey production schedules",
      "Uniform quality control across batch runs",
      "On-site delivery and professional assembly"
    ]
  },
  {
    id: "serv-wood-consultation",
    title: "Showroom Consultation & Wood Selection",
    slug: "showroom-consultation",
    description: "Visit our Shamsabad facility to inspect wood grain samples, test seat ergonomic firmness, and consult directly with our master craftsmen.",
    image: "/images/cat_bedroom_1791186990246.jpg",
    order_index: 4,
    is_active: true,
    details: [
      "Physical sample viewing of Sheesham, Teak, and Oak",
      "Space planning and measurement guidance",
      "Transparent quotes with zero hidden surprises",
      "Direct WhatsApp contact with the business owner"
    ]
  }
];

export const initialReviews: Review[] = [
  {
    id: "rev-1",
    author_name: "Hamza Tariq",
    location: "Bahria Town Phase 7, Rawalpindi",
    rating: 5,
    review_text: "Ordered a complete master bedroom set and custom L-shaped sofa. The solid Sheesham finish is immaculate and termite-proof seasoned. Delivered right on schedule to our Bahria residence.",
    is_approved: true,
    is_featured: true,
    created_at: "2026-03-12"
  },
  {
    id: "rev-2",
    author_name: "Dr. Ayesha Malik",
    location: "Sector F-8/2, Islamabad",
    rating: 5,
    review_text: "We wanted a 10-seater custom dining table with specific live-edge walnut specs that we couldn't find in typical commercial shops. Woodgear Furniture crafted it to perfection. Highly recommended!",
    is_approved: true,
    is_featured: true,
    created_at: "2026-02-28"
  },
  {
    id: "rev-3",
    author_name: "Usman Rafique",
    location: "Satellite Town, Rawalpindi",
    rating: 5,
    review_text: "The direct WhatsApp communication with Imran Bhai made customization effortless. Sent them our Pinterest inspiration, and the resulting sofa set surpassed our expectations. Honest factory pricing.",
    is_approved: true,
    is_featured: true,
    created_at: "2026-01-20"
  }
];

export const initialBlogPosts: BlogPost[] = [
  {
    id: "blog-1",
    title: "How to Choose the Right Wood for Furniture in Rawalpindi & Islamabad",
    slug: "choose-right-wood-furniture-rawalpindi",
    excerpt: "Understanding the climate demands of the Twin Cities: comparing Solid Sheesham (Tahli), Teak, and imported hardwoods for longevity.",
    content: `When investing in furniture for your home in Rawalpindi or Islamabad, the foremost consideration should always be wood seasoning and moisture control.

The Twin Cities experience pronounced weather fluctuations: dry winter chills followed by intense monsoon humidity. Unseasoned wood expands during July-August and shrinks in November, causing joint cracking and drawer warping.

### 1. Solid Sheesham (Indian Rosewood / Tahli)
Sheesham is renowned across Punjab for its extraordinary density, distinctive interlocked grain, and natural termite resistance. Properly kiln-dried Sheesham furniture lasts generations and acquires a deeper patina with age.

### 2. Seasoned Teak Wood
For exterior or high-humidity zones, Teak's natural oil content repels water and prevents rot. It is widely preferred for dining tables and luxury door frames.

### 3. What to Check Before Purchasing:
- Ask if the timber has been seasoned in a temperature-controlled kiln.
- Inspect the joinery: look for traditional mortise-and-tenon or dovetail joints rather than basic stapling.
- Check the polish underside to ensure all surfaces are sealed against atmospheric moisture.

At Woodgear Furniture, all our timbers undergo rigorous natural seasoning followed by protective sealing to guarantee stability in Pakistani homes.`,
    featured_image: "/images/cat_dining_1791187001317.jpg",
    category: "Wood & Craftsmanship",
    author: "Imran Shah",
    published_at: "2026-03-15",
    is_published: true,
    read_time: "5 min read",
    seo_title: "Best Wood for Furniture in Rawalpindi & Islamabad | Guide",
    meta_description: "Learn how to select termite-proof seasoned Sheesham and Teak furniture suited for the Rawalpindi and Islamabad climate."
  },
  {
    id: "blog-2",
    title: "Custom Sofa Manufacturing: What Happens Inside the Workshop",
    slug: "custom-sofa-manufacturing-process",
    excerpt: "A behind-the-scenes look at kiln-dried framing, Molty foam density layers, and upholstery selection at our Shamsabad workshop.",
    content: `Most commercial retail sofas look appealing in showroom lighting, but begin sagging within 18 months. Why? Because mass manufacturers cut corners where customers cannot see: the internal frame and foam density.

### Step 1: The Hardwood Skeleton
We construct our sofa skeletons from kiln-seasoned hardwood beams rather than lightweight softwoods or scrap particleboard. Corner blocks are glued and screwed to absorb continuous seating shock.

### Step 2: Suspension & Springing
Heavy-gauge zigzag springs and interwoven nylon webbing provide the foundational elasticity, preventing the dreaded middle sag.

### Step 3: High-Density Molty Cushioning
We use high-resilience Molty foam with graduated density layers: firmer at the core for spinal support, softer at the crown for initial comfort.

### Step 4: Tailored Fabric Fitting
Every seam is double-stitched with bonded nylon thread to endure daily household use.

Whether you desire a contemporary curved bouclé sofa or a grand classical set, custom manufacturing lets you choose the exact dimensions to suit your living room.`,
    featured_image: "/images/hero_luxury_living_1791186963111.jpg",
    category: "Sofa Buying Guide",
    author: "Imran Shah",
    published_at: "2026-02-10",
    is_published: true,
    read_time: "4 min read",
    seo_title: "Custom Sofa Manufacturing Guide Rawalpindi",
    meta_description: "Understand internal sofa framing, high-density foam, and custom fabric choices before buying a sofa in Rawalpindi."
  }
];

export const initialFAQs: FAQ[] = [
  {
    id: "faq-1",
    question: "Do you manufacture custom furniture based on photos or drawings?",
    answer: "Yes, absolutely! Custom manufacturing is our primary specialty. You can send us reference photos, Pinterest pins, architectural blueprints, or sketches via WhatsApp (+92 332 5099930). We will review the dimensions, recommend the best wood species, and give you an exact custom manufacturing quote.",
    category: "Custom Orders",
    order_index: 1,
    is_active: true
  },
  {
    id: "faq-2",
    question: "Where is your showroom located and can I visit?",
    answer: "Our showroom and workshop are located at M33J+C6H, Shamsabad, Rawalpindi, Pakistan (Postal Code 46000). We welcome visitors Monday through Sunday between 9:00 AM and 9:00 PM. Visiting allows you to touch the wood grains, feel our foam comfort, and see pieces in active production.",
    category: "Showroom & Visits",
    order_index: 2,
    is_active: true
  },
  {
    id: "faq-3",
    question: "What woods do you use in your furniture?",
    answer: "We primarily work with solid seasoned Sheesham (Indian Rosewood/Tahli), Burma/Golden Teak, American Walnut, and Ash wood. All timber is fully seasoned and treated against termites before woodworking begins.",
    category: "Materials & Quality",
    order_index: 3,
    is_active: true
  },
  {
    id: "faq-4",
    question: "How do I get an estimate for a furniture piece?",
    answer: "You can click any 'Enquire on WhatsApp' button across the website to open a direct chat with us, pre-filled with the product details. Alternatively, submit the contact form or call +92 332 5099930.",
    category: "Quotes & Orders",
    order_index: 4,
    is_active: true
  },
  {
    id: "faq-5",
    question: "Do you deliver to Islamabad and other areas?",
    answer: "Yes! We provide safe, padded delivery and on-site professional assembly across Rawalpindi, Islamabad (all sectors including DHA and Bahria Town), and can arrange logistics for other cities throughout Pakistan.",
    category: "Delivery & Assembly",
    order_index: 5,
    is_active: true
  },
  {
    id: "faq-6",
    question: "Do you offer wholesale pricing for commercial projects?",
    answer: "Yes. As direct manufacturers, we supply hotel suites, guest houses, corporate offices, and interior design firms with wholesale contract pricing for bulk orders.",
    category: "Wholesale",
    order_index: 6,
    is_active: true
  }
];

export const initialVideos: VideoItem[] = [
  {
    id: "vid-1",
    title: "Shamsabad Workshop Craftsmanship Walkthrough",
    description: "Witness our master woodworkers hand-sanding solid Sheesham timbers and assembling custom dining joints.",
    video_url: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    thumbnail: "/images/cat_dining_1791187001317.jpg",
    category: "Craftsmanship",
    is_featured: true,
    order_index: 1
  },
  {
    id: "vid-2",
    title: "Curved Bouclé Sofa Production Reel",
    description: "Detailed look at the multi-density foam layering and precision upholstery tailoring of our luxury curved sectional.",
    video_url: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    thumbnail: "/images/hero_luxury_living_1791186963111.jpg",
    category: "Showcase",
    is_featured: true,
    order_index: 2
  }
];
