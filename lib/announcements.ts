export interface Announcement {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  author: {
    name: string;
    role: string;
  };
  tags: string[];
}

export const announcements: Announcement[] = [
  {
    id: "community-town-hall-2025",
    title: "Community Town Hall Meeting - January 2025",
    excerpt:
      "Join us for an important discussion on upcoming infrastructure projects and community development initiatives.",
    content: `
# Community Town Hall Meeting - January 2025

We are excited to invite all residents of Santa Maria to our upcoming Town Hall Meeting on January 15, 2025. This is a crucial opportunity for community members to engage directly with local government officials and participate in shaping the future of our municipality.

## Meeting Agenda

### Infrastructure Development
Our city is embarking on several major infrastructure projects designed to improve quality of life for all residents:

- **Road Improvement Program**: A comprehensive plan to repair and upgrade 50 miles of city streets, including the installation of new traffic signals and pedestrian crossings.
- **Water System Modernization**: Investment in our water infrastructure to ensure clean, reliable water supply for the next 50 years.
- **Public Facilities Renovation**: Updates to community centers, libraries, and recreational facilities across all districts.

### Community Development Initiatives

We're launching several programs aimed at fostering community growth and engagement:

1. **Small Business Support Program**: Grants and resources for local entrepreneurs
2. **Youth Development Centers**: New after-school programs and mentorship opportunities
3. **Senior Services Expansion**: Enhanced healthcare and social services for our elderly population
4. **Environmental Sustainability**: Green initiatives including solar panel installations and recycling programs

## How to Participate

**Date**: January 15, 2025  
**Time**: 6:00 PM - 8:30 PM  
**Location**: Santa Maria City Hall, Main Auditorium  
**Virtual Option**: Live stream available on our website

### Registration
While walk-ins are welcome, we encourage pre-registration to help us plan accordingly. You can register online through our website or call our office at (805) 925-0951.

### Submit Questions
Have specific questions or concerns? Submit them in advance through our online portal, and we'll ensure they're addressed during the meeting.

## What to Expect

The meeting will be structured to maximize community input:

- **Opening Remarks** (6:00 PM): Mayor's welcome and overview
- **Project Presentations** (6:15 PM): Detailed information on upcoming initiatives
- **Q&A Session** (7:00 PM): Open forum for community questions
- **Breakout Discussions** (7:30 PM): Small group conversations on specific topics
- **Closing Remarks** (8:15 PM): Summary and next steps

## Your Voice Matters

This Town Hall represents our commitment to transparent, inclusive governance. Your input will directly influence decision-making processes and help prioritize projects that matter most to our community.

We look forward to seeing you there and working together to build a stronger Santa Maria!

---

**Contact Information**  
For more information, please contact:  
Community Engagement Office  
Email: engagement@santamaria.gov  
Phone: (805) 925-0951
    `,
    image:
      "https://images.unsplash.com/photo-1555069855-e580a9adbf43?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBtZWV0aW5nJTIwdG93biUyMGhhbGwlMjBwZW9wbGUlMjBkaXNjdXNzaW9ufGVufDB8MHx8fDE3NTk4MzkzNTR8MA&ixlib=rb-4.1.0&q=85",
    category: "Community Updates",
    date: "January 15, 2025",
    readTime: "5 min read",
    author: {
      name: "Maria Rodriguez",
      role: "Community Engagement Director",
    },
    tags: [
      "Town Hall",
      "Infrastructure",
      "Community Development",
      "Public Meeting",
    ],
  },
  {
    id: "public-transportation-routes",
    title: "New Public Transportation Routes Announced",
    excerpt:
      "Expanding our public transit system to better serve all neighborhoods with improved accessibility and frequency.",
    content: `
# New Public Transportation Routes Announced

Santa Maria Municipal is proud to announce a major expansion of our public transportation network, designed to improve connectivity across all districts and provide better access to essential services for all residents.

## Overview of New Routes

Starting February 1, 2025, we will introduce five new bus routes and enhance service on existing lines:

### New Routes

**Route 101 - East District Express**
- Connects residential areas in East Santa Maria to downtown business district
- Service every 15 minutes during peak hours
- Stops at major employment centers, schools, and shopping areas

**Route 102 - Medical Center Connector**
- Direct service to Santa Maria Regional Medical Center
- Accessible buses with priority seating
- Extended hours to accommodate shift workers

**Route 103 - University Loop**
- Serves Santa Maria Community College and surrounding student housing
- Late-night service for evening classes
- Bike racks on all buses

**Route 104 - South Side Shuttle**
- Improved access for underserved neighborhoods
- Connections to grocery stores, pharmacies, and community centers
- Bilingual announcements and signage

**Route 105 - Airport Express**
- Direct service between downtown and Santa Maria Airport
- Luggage storage space
- Real-time flight information displays

## Enhanced Services

### Frequency Improvements
- Peak hour service increased from every 30 minutes to every 15 minutes on major routes
- Weekend service extended by 2 hours on popular lines
- New early morning routes for shift workers

### Technology Upgrades
- Real-time bus tracking via mobile app
- Digital payment options including contactless cards
- USB charging ports on all new buses
- Free Wi-Fi on express routes

### Accessibility Features
- 100% of fleet now wheelchair accessible
- Audio and visual stop announcements
- Priority seating clearly marked
- Service animals always welcome

## Environmental Impact

This expansion represents our commitment to sustainability:

- **Reduced Carbon Emissions**: Expected to remove 500+ cars from daily commutes
- **Electric Fleet**: 30% of new buses are fully electric
- **Green Infrastructure**: Solar-powered bus shelters with LED lighting
- **Bike Integration**: All buses equipped with bike racks

## Fare Structure

We're maintaining affordable fares while introducing new options:

- **Single Ride**: $2.00 (unchanged)
- **Day Pass**: $5.00
- **Monthly Pass**: $60.00
- **Senior/Student Discount**: 50% off all fares
- **Low-Income Program**: Reduced fares for qualifying residents

### Free Transfer Policy
Transfers between routes are free within 2 hours of initial boarding.

## Community Input

This expansion was developed based on extensive community feedback:

- 15 public meetings held across all districts
- 3,000+ survey responses collected
- Direct input from neighborhood associations
- Collaboration with employers and schools

## Implementation Timeline

- **February 1, 2025**: Routes 101, 102, and 103 launch
- **March 1, 2025**: Routes 104 and 105 begin service
- **April 1, 2025**: Full frequency enhancements implemented
- **May 1, 2025**: Complete technology rollout

## How to Learn More

**Information Sessions**  
Join us for free information sessions:
- January 20: East District Community Center (6 PM)
- January 22: South Side Library (6 PM)
- January 24: City Hall (6 PM)

**Online Resources**
- Interactive route maps on our website
- Mobile app available for iOS and Android
- Video tutorials in English and Spanish

**Customer Service**  
Transit Information Hotline: (805) 925-RIDE (7433)  
Email: transit@santamaria.gov  
Hours: Monday-Friday, 7 AM - 7 PM

Together, we're building a more connected, accessible, and sustainable Santa Maria!
    `,
    image:
      "https://images.unsplash.com/photo-1610932975716-df20896edfe5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxwdWJsaWMlMjBzZXJ2aWNlJTIwaW5mcmFzdHJ1Y3R1cmUlMjBjb21tdW5pdHklMjBkZXZlbG9wbWVudHxlbnwwfDB8fHwxNzU5ODM5MzU0fDA&ixlib=rb-4.1.0&q=85",
    category: "Public Services",
    date: "January 12, 2025",
    readTime: "4 min read",
    author: {
      name: "James Chen",
      role: "Transportation Director",
    },
    tags: [
      "Public Transit",
      "Transportation",
      "Accessibility",
      "Sustainability",
    ],
  },
  {
    id: "cultural-festival-2025",
    title: "Annual Cultural Festival Returns This Spring",
    excerpt:
      "Celebrate our diverse community with music, food, and cultural performances from around the world.",
    content: `
# Annual Cultural Festival Returns This Spring

Mark your calendars! The beloved Santa Maria Cultural Festival is returning for its 25th anniversary celebration on April 12-14, 2025. This three-day event promises to be our biggest and most diverse celebration yet.

## Festival Highlights

### Day 1: Friday, April 12 - Opening Night Gala
**5:00 PM - 10:00 PM | Downtown Plaza**

- Grand Opening Ceremony featuring the Mayor and cultural ambassadors
- International Food Court with 40+ vendors
- Live performances from local artists
- Cultural fashion show
- Art installations and exhibitions

### Day 2: Saturday, April 13 - Main Festival Day
**10:00 AM - 11:00 PM | City Park**

**Morning Activities (10 AM - 2 PM)**
- Children's Cultural Workshop
- Traditional craft demonstrations
- Cooking classes with international chefs
- Language learning sessions

**Afternoon Entertainment (2 PM - 6 PM)**
- Main Stage performances featuring music and dance from 15 countries
- Street performers and interactive art
- Cultural pavilions representing our diverse communities
- Sports demonstrations (martial arts, traditional games)

**Evening Celebration (6 PM - 11 PM)**
- Headliner concert featuring Grammy-nominated artists
- Food and wine tasting
- Silent disco with international DJs
- Fireworks spectacular at 9:30 PM

### Day 3: Sunday, April 14 - Family Day
**11:00 AM - 8:00 PM | Community Center**

- Family-friendly activities and games
- Cultural storytelling sessions
- Kids' talent show
- Community potluck (bring your favorite dish!)
- Closing ceremony and awards

## Cultural Pavilions

Experience the richness of our community through dedicated pavilions:

- **Asian Heritage**: Chinese, Japanese, Korean, Filipino, Vietnamese cultures
- **Latin American**: Mexican, Central and South American traditions
- **European**: Italian, German, Irish, Polish celebrations
- **African Diaspora**: West African, Caribbean, African American culture
- **Middle Eastern**: Persian, Arab, Turkish traditions
- **Pacific Islander**: Hawaiian, Samoan, Tongan heritage
- **Indigenous Peoples**: Native American culture and history

## Food & Beverage

Over 50 food vendors offering authentic cuisine:
- Street tacos and tamales
- Sushi and ramen
- Mediterranean mezze
- BBQ and soul food
- Vegetarian and vegan options
- International desserts and pastries
- Craft beer and wine garden (21+)

## Entertainment Lineup

**Main Stage Performers**
- Los Tigres del Norte (Saturday headliner)
- Traditional Irish Dance Troupe
- Taiko Drum Ensemble
- Flamenco Dancers
- Gospel Choir
- DJ sets from local talent

**Roaming Performers**
- Stilt walkers
- Face painters
- Balloon artists
- Street musicians
- Cultural dance groups

## Workshops & Activities

**Free Workshops** (registration required)
- Salsa dancing lessons
- Origami and paper crafts
- Henna art
- Calligraphy
- Traditional cooking
- Musical instrument demonstrations

**Kids Zone**
- Bounce houses
- Face painting
- Craft stations
- Storytelling tent
- Interactive games

## Vendor Marketplace

Shop from 100+ vendors offering:
- Handmade crafts and jewelry
- Traditional clothing and textiles
- Art and home decor
- Books and music
- Cultural artifacts
- Fair trade products

## Admission & Parking

**Admission**
- FREE for all ages!
- VIP passes available ($50) include:
  - Reserved seating at main stage
  - Access to VIP lounge
  - Complimentary food and beverage vouchers
  - Festival merchandise

**Parking**
- Free parking at designated lots with shuttle service
- Bike valet available
- Public transportation encouraged (free festival shuttle)

## Volunteer Opportunities

Join our team of 500+ volunteers! Benefits include:
- Free festival t-shirt
- Meal vouchers
- VIP access during off-duty hours
- Community service hours certificate

Sign up at: volunteers@santamariafestival.org

## Sponsorship

Support our community celebration! Sponsorship packages available at various levels. Contact our sponsorship team:
- Email: sponsors@santamariafestival.org
- Phone: (805) 925-0951 ext. 234

## Health & Safety

- First aid stations throughout venue
- Security personnel on-site
- Lost and found services
- Accessible facilities and viewing areas
- Service animals welcome

## Stay Connected

**Website**: www.santamariafestival.org  
**Social Media**: @SantaMariaCulturalFest  
**Hashtag**: #SantaMaria2025  
**Email**: info@santamariafestival.org

Join us in celebrating the beautiful diversity that makes Santa Maria special. See you at the festival!
    `,
    image:
      "https://images.unsplash.com/photo-1758388536193-affe81d27c9a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxsb2NhbCUyMGV2ZW50JTIwZmVzdGl2YWwlMjBjb21tdW5pdHklMjBjZWxlYnJhdGlvbnxlbnwwfDB8fHwxNzU5ODM5MzU0fDA&ixlib=rb-4.1.0&q=85",
    category: "Events",
    date: "January 10, 2025",
    readTime: "3 min read",
    author: {
      name: "Sofia Martinez",
      role: "Cultural Affairs Coordinator",
    },
    tags: ["Festival", "Culture", "Community", "Entertainment", "Family Event"],
  },
  {
    id: "urban-development-plan-2025",
    title: "Urban Development Plan 2025-2030",
    excerpt:
      "Comprehensive overview of our city's growth strategy focusing on sustainable infrastructure and smart city initiatives.",
    content: `# Urban Development Plan 2025-2030\n\nOur comprehensive urban development strategy for the next five years.`,
    image:
      "https://images.unsplash.com/photo-1758304480874-253e82fc6418?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxjaXR5JTIwcGxhbm5pbmclMjB1cmJhbiUyMGRldmVsb3BtZW50fGVufDB8MHx8fDE3NTk4MzkzNTR8MA&ixlib=rb-4.1.0&q=85",
    category: "Reports",
    date: "January 8, 2025",
    readTime: "8 min read",
    author: { name: "David Chen", role: "Urban Planning Director" },
    tags: ["Development", "Planning", "Infrastructure"],
  },
  {
    id: "green-spaces-initiative",
    title: "Green Spaces Initiative Launch",
    excerpt:
      "New parks and recreational areas to enhance community wellness and environmental sustainability.",
    content: `# Green Spaces Initiative\n\nExpanding green spaces throughout Santa Maria for healthier communities.`,
    image:
      "https://images.unsplash.com/photo-1604287285211-148c4be92d12?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwzfHxlbnZpcm9ubWVudGFsJTIwc3VzdGFpbmFiaWxpdHklMjBncmVlbiUyMHNwYWNlc3xlbnwwfDB8fGdyZWVufDE3NTk4MzkzNTR8MA&ixlib=rb-4.1.0&q=85",
    category: "Community Updates",
    date: "January 6, 2025",
    readTime: "6 min read",
    author: { name: "Elena Rodriguez", role: "Parks & Recreation Manager" },
    tags: ["Environment", "Parks", "Sustainability"],
  },
  {
    id: "education-excellence-program",
    title: "Education Excellence Program",
    excerpt:
      "Investing in our future with enhanced educational facilities and innovative learning programs.",
    content: `# Education Excellence Program\n\nNew initiatives to improve educational outcomes for all students.`,
    image:
      "https://images.unsplash.com/photo-1567057419565-4349c49d8a04?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBzY2hvb2wlMjBzdHVkZW50c3xlbnwwfDB8fHwxNzU5ODM5MzU4fDA&ixlib=rb-4.1.0&q=85",
    category: "Reports",
    date: "January 2, 2025",
    readTime: "7 min read",
    author: { name: "Dr. James Thompson", role: "Education Superintendent" },
    tags: ["Education", "Schools", "Youth"],
  },
  {
    id: "healthcare-access-improvements",
    title: "Healthcare Access Improvements",
    excerpt:
      "Expanding medical services and facilities to ensure quality healthcare for all residents.",
    content: `# Healthcare Access Improvements\n\nComprehensive healthcare expansion across all districts.`,
    image:
      "https://images.unsplash.com/photo-1710074213379-2a9c2653046a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwbWVkaWNhbCUyMGZhY2lsaXRpZXN8ZW58MHwwfHx8MTc1OTgzOTM1OHww&ixlib=rb-4.1.0&q=85",
    category: "Public Services",
    date: "December 30, 2024",
    readTime: "6 min read",
    author: { name: "Dr. Sarah Williams", role: "Public Health Director" },
    tags: ["Healthcare", "Medical", "Wellness"],
  },
  {
    id: "local-business-support",
    title: "Local Business Support Program",
    excerpt:
      "New initiatives to boost local economy and support small businesses in our community.",
    content: `# Local Business Support Program\n\nGrants and resources available for local entrepreneurs.`,
    image:
      "https://images.unsplash.com/photo-1758346973678-0d027b70d14f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxsb2NhbCUyMGJ1c2luZXNzJTIwbWFya2V0fGVufDB8MHx8fDE3NTk4MzkzNTh8MA&ixlib=rb-4.1.0&q=85",
    category: "Community Updates",
    date: "December 28, 2024",
    readTime: "5 min read",
    author: { name: "Michael Chang", role: "Economic Development Officer" },
    tags: ["Business", "Economy", "Entrepreneurship"],
  },
  {
    id: "digital-services-upgrade",
    title: "Digital Services Platform Upgrade",
    excerpt:
      "Enhanced online portal for easier access to municipal services and information.",
    content: `# Digital Services Upgrade\n\nNew digital platform for streamlined city services.`,
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwdGVjaG5vbG9neXxlbnwwfDB8fHwxNzU5ODM5MzU4fDA&ixlib=rb-4.1.0&q=85",
    category: "Public Services",
    date: "December 26, 2024",
    readTime: "4 min read",
    author: { name: "Lisa Anderson", role: "IT Services Manager" },
    tags: ["Technology", "Digital", "Innovation"],
  },
  {
    id: "recycling-expansion",
    title: "Recycling Program Expansion",
    excerpt:
      "Comprehensive waste management and recycling initiative to reduce environmental impact.",
    content: `# Recycling Expansion\n\nEnhanced recycling services for all residential areas.`,
    image:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxyZWN5Y2xpbmclMjBlbnZpcm9ubWVudHxlbnwwfDB8fHwxNzU5ODM5MzU4fDA&ixlib=rb-4.1.0&q=85",
    category: "Reports",
    date: "December 24, 2024",
    readTime: "5 min read",
    author: { name: "Robert Green", role: "Environmental Services Director" },
    tags: ["Environment", "Recycling", "Sustainability"],
  },
  {
    id: "senior-wellness-center",
    title: "New Senior Wellness Center Opening",
    excerpt:
      "State-of-the-art facility dedicated to senior health, activities, and community engagement.",
    content: `# Senior Wellness Center\n\nNew facility providing comprehensive services for our senior community.`,
    image:
      "https://images.unsplash.com/photo-1581579186913-45ac3e6efe93?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxzZW5pb3IlMjBjZW50ZXIlMjBoZWFsdGh8ZW58MHwwfHx8MTc1OTgzOTM1OHww&ixlib=rb-4.1.0&q=85",
    category: "Community Updates",
    date: "December 22, 2024",
    readTime: "4 min read",
    author: { name: "Patricia Martinez", role: "Senior Services Coordinator" },
    tags: ["Seniors", "Healthcare", "Community"],
  },
  {
    id: "youth-sports-league",
    title: "Youth Sports League Registration",
    excerpt:
      "Spring 2025 youth sports programs now open for registration across all age groups.",
    content: `# Youth Sports League\n\nRegister now for spring sports programs for youth ages 5-18.`,
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHx5b3V0aCUyMHNwb3J0cyUyMGtpZHN8ZW58MHwwfHx8MTc1OTgzOTM1OHww&ixlib=rb-4.1.0&q=85",
    category: "Events",
    date: "December 20, 2024",
    readTime: "3 min read",
    author: { name: "Coach Ryan Miller", role: "Youth Programs Director" },
    tags: ["Youth", "Sports", "Recreation"],
  },
  {
    id: "street-lighting-upgrade",
    title: "LED Street Lighting Upgrade Project",
    excerpt:
      "Citywide replacement of street lights with energy-efficient LED technology.",
    content: `# Street Lighting Upgrade\n\nModern LED lighting for safer streets and energy savings.`,
    image:
      "https://images.unsplash.com/photo-1513828583688-c52646db42da?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxzdHJlZXQlMjBsaWdodGluZyUyMGNpdHl8ZW58MHwwfHx8MTc1OTgzOTM1OHww&ixlib=rb-4.1.0&q=85",
    category: "Public Services",
    date: "December 18, 2024",
    readTime: "4 min read",
    author: { name: "Tom Richards", role: "Public Works Manager" },
    tags: ["Infrastructure", "Energy", "Safety"],
  },
  {
    id: "library-renovation",
    title: "Central Library Renovation Complete",
    excerpt:
      "Modernized library with new technology, study spaces, and community programming areas.",
    content: `# Library Renovation\n\nYour renovated library is ready with enhanced facilities and services.`,
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxsaWJyYXJ5JTIwbW9kZXJuJTIwYm9va3N8ZW58MHwwfHx8MTc1OTgzOTM1OHww&ixlib=rb-4.1.0&q=85",
    category: "Community Updates",
    date: "December 16, 2024",
    readTime: "5 min read",
    author: { name: "Linda Johnson", role: "Library Director" },
    tags: ["Library", "Education", "Community"],
  },
  {
    id: "emergency-preparedness",
    title: "Emergency Preparedness Workshop Series",
    excerpt:
      "Free community workshops on emergency preparedness and disaster response planning.",
    content: `# Emergency Preparedness\n\nLearn essential skills for emergency situations and disaster readiness.`,
    image:
      "https://images.unsplash.com/photo-1585421514738-01798e348b17?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxlbWVyZ2VuY3klMjBwcmVwYXJlZG5lc3N8ZW58MHwwfHx8MTc1OTgzOTM1OHww&ixlib=rb-4.1.0&q=85",
    category: "Public Services",
    date: "December 14, 2024",
    readTime: "4 min read",
    author: { name: "Fire Chief Mark Davis", role: "Emergency Services" },
    tags: ["Safety", "Emergency", "Training"],
  },
  {
    id: "farmers-market-expansion",
    title: "Farmers Market Expansion Announced",
    excerpt:
      "Extended hours and more vendors at our community farmers market starting this spring.",
    content: `# Farmers Market Expansion\n\nMore local produce, crafts, and food vendors coming soon.`,
    image:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxmYXJtZXJzJTIwbWFya2V0JTIwZnJlc2h8ZW58MHwwfHx8MTc1OTgzOTM1OHww&ixlib=rb-4.1.0&q=85",
    category: "Events",
    date: "December 12, 2024",
    readTime: "3 min read",
    author: { name: "Susan Parker", role: "Community Events Coordinator" },
    tags: ["Market", "Local", "Food"],
  },
  {
    id: "bike-path-network",
    title: "New Bike Path Network Unveiled",
    excerpt:
      "Interconnected bike paths promoting active transportation and reducing traffic congestion.",
    content: `# Bike Path Network\n\nSafe and convenient bike routes connecting all major districts.`,
    image:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxiaWtlJTIwcGF0aCUyMGN5Y2xpbmd8ZW58MHwwfHx8MTc1OTgzOTM1OHww&ixlib=rb-4.1.0&q=85",
    category: "Reports",
    date: "December 10, 2024",
    readTime: "6 min read",
    author: { name: "Carlos Mendez", role: "Transportation Planner" },
    tags: ["Transportation", "Cycling", "Infrastructure"],
  },
  {
    id: "art-in-parks",
    title: "Art in the Parks Summer Program",
    excerpt:
      "Free outdoor art exhibitions and workshops throughout our city parks this summer.",
    content: `# Art in the Parks\n\nCelebrating local artists with outdoor exhibitions and interactive workshops.`,
    image:
      "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxhcnQlMjBwYXJrJTIwb3V0ZG9vcnxlbnwwfDB8fHwxNzU5ODM5MzU4fDA&ixlib=rb-4.1.0&q=85",
    category: "Events",
    date: "December 8, 2024",
    readTime: "4 min read",
    author: { name: "Isabella Torres", role: "Arts & Culture Director" },
    tags: ["Arts", "Culture", "Parks"],
  },
  {
    id: "water-conservation",
    title: "Water Conservation Incentive Program",
    excerpt:
      "Rebates and incentives for residents who implement water-saving measures at home.",
    content: `# Water Conservation Program\n\nFinancial incentives for water-efficient landscaping and fixtures.`,
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHx3YXRlciUyMGNvbnNlcnZhdGlvbiUyMHNhdmluZ3xlbnwwfDB8fHwxNzU5ODM5MzU4fDA&ixlib=rb-4.1.0&q=85",
    category: "Reports",
    date: "December 6, 2024",
    readTime: "5 min read",
    author: { name: "Jennifer Lee", role: "Water Resources Manager" },
    tags: ["Water", "Conservation", "Sustainability"],
  },
  {
    id: "neighborhood-watch",
    title: "Neighborhood Watch Program Launch",
    excerpt:
      "Community-based crime prevention program fostering safer neighborhoods through vigilance.",
    content: `# Neighborhood Watch\n\nJoin your neighbors in keeping our community safe and connected.`,
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxuZWlnaGJvcmhvb2QlMjBjb21tdW5pdHklMjBzYWZldHl8ZW58MHwwfHx8MTc1OTgzOTM1OHww&ixlib=rb-4.1.0&q=85",
    category: "Public Services",
    date: "December 4, 2024",
    readTime: "4 min read",
    author: { name: "Police Chief Anderson", role: "Law Enforcement" },
    tags: ["Safety", "Community", "Crime Prevention"],
  },
  {
    id: "tech-workshops",
    title: "Free Technology Workshops for Seniors",
    excerpt:
      "Learn computer skills, smartphone usage, and online safety in friendly, supportive classes.",
    content: `# Technology Workshops\n\nBeginner-friendly tech training designed especially for seniors.`,
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxzZW5pb3IlMjB0ZWNobm9sb2d5JTIwY29tcHV0ZXJ8ZW58MHwwfHx8MTc1OTgzOTM1OHww&ixlib=rb-4.1.0&q=85",
    category: "Community Updates",
    date: "December 2, 2024",
    readTime: "3 min read",
    author: { name: "Amanda White", role: "Digital Literacy Coordinator" },
    tags: ["Technology", "Seniors", "Education"],
  },
  {
    id: "tree-planting",
    title: "Community Tree Planting Initiative",
    excerpt:
      "Volunteer opportunities to plant 1,000 trees across the city for a greener future.",
    content: `# Tree Planting Initiative\n\nHelp us reach our goal of 1,000 new trees this year.`,
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHx0cmVlJTIwcGxhbnRpbmclMjBjb21tdW5pdHl8ZW58MHwwfHx8MTc1OTgzOTM1OHww&ixlib=rb-4.1.0&q=85",
    category: "Community Updates",
    date: "November 30, 2024",
    readTime: "4 min read",
    author: { name: "Marcus Green", role: "Environmental Coordinator" },
    tags: ["Environment", "Volunteering", "Trees"],
  },
  {
    id: "budget-hearing",
    title: "Annual Budget Public Hearing",
    excerpt:
      "Review proposed budget allocations and provide input on spending priorities for next fiscal year.",
    content: `# Budget Public Hearing\n\nYour opportunity to influence how city funds are allocated.`,
    image:
      "https://images.unsplash.com/photo-1554224311-beee415c201f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxidWRnZXQlMjBmaW5hbmNlJTIwbWVldGluZ3xlbnwwfDB8fHwxNzU5ODM5MzU4fDA&ixlib=rb-4.1.0&q=85",
    category: "Reports",
    date: "November 28, 2024",
    readTime: "7 min read",
    author: { name: "Kevin Brooks", role: "Finance Director" },
    tags: ["Budget", "Finance", "Reports"],
  },
  {
    id: "holiday-parade",
    title: "Annual Holiday Parade Details",
    excerpt:
      "Join us for our spectacular holiday parade featuring floats, music, and community spirit.",
    content: `# Holiday Parade\n\nFestive parade celebrating the holiday season with our community.`,
    image:
      "https://images.unsplash.com/photo-1512389142860-9c449e58a543?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxob2xpZGF5JTIwcGFyYWRlJTIwZmVzdGl2ZXxlbnwwfDB8fHwxNzU5ODM5MzU4fDA&ixlib=rb-4.1.0&q=85",
    category: "Events",
    date: "November 26, 2024",
    readTime: "3 min read",
    author: { name: "Rachel Adams", role: "Special Events Manager" },
    tags: ["Holiday", "Parade", "Community"],
  },
  {
    id: "affordable-housing",
    title: "Affordable Housing Development Approved",
    excerpt:
      "New affordable housing project will provide 200 units for low to moderate-income families.",
    content: `# Affordable Housing Project\n\nExpanding housing options for working families in Santa Maria.`,
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxhZmZvcmRhYmxlJTIwaG91c2luZyUyMGFwYXJ0bWVudHxlbnwwfDB8fHwxNzU5ODM5MzU4fDA&ixlib=rb-4.1.0&q=85",
    category: "Reports",
    date: "November 24, 2024",
    readTime: "6 min read",
    author: { name: "Director Sarah Kim", role: "Housing Authority" },
    tags: ["Housing", "Development", "Community"],
  },
  {
    id: "storm-drainage",
    title: "Storm Drainage System Improvements",
    excerpt:
      "Major upgrades to prevent flooding and improve water management citywide.",
    content: `# Storm Drainage Improvements\n\nEnhancing our infrastructure to better handle storm water.`,
    image:
      "https://images.unsplash.com/photo-1523289333742-be1143f6b766?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxzdG9ybSUyMGRyYWluJTIwd2F0ZXJ8ZW58MHwwfHx8MTc1OTgzOTM1OHww&ixlib=rb-4.1.0&q=85",
    category: "Public Services",
    date: "November 22, 2024",
    readTime: "5 min read",
    author: { name: "Engineer Mike Foster", role: "Public Works" },
    tags: ["Infrastructure", "Water", "Flooding"],
  },
];

export function getAnnouncementById(id: string): Announcement | undefined {
  return announcements.find((announcement) => announcement.id === id);
}

export function getAllAnnouncements(): Announcement[] {
  return announcements;
}
