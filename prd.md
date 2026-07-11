Product Requirement Document (PRD) & System User Flows

Project Name: GWealth Nation Unified Platform
Official Entities: G-Wealth Republic / GWealth Properties
Target Domain: gwealthnation.com (Frontend) & portal.gwealthnation.com (MERN Portal)
Version: 1.0.0
Date: July 2026

1. Executive Summary & Objective

GWealth Nation (operating officially as G-Wealth Republic or GWealth Properties) is a prominent Nigerian real estate and property development firm. The company operates extensively in southeastern and southern Nigeria—with major offices in Aba (Abia State), Asaba (Delta State), and an expanding footprint in Port Harcourt, Abuja, and Anambra.

The Core Challenge

The business leverages a hybrid marketing engine: direct land sales to everyday buyers, and a powerful multi-tier network of independent realtors and business owners. Additionally, public brand confusion exists between GWealth Nation and "Wealth Nation Empowerment" (a micro-savings/food security scheme).

The Solution

To deliver a rock-solid, secure, and fast system that will never break down due to platform updates or scale, we are decoupling the infrastructure:

WordPress Frontend (gwealthnation.com): High-speed, SEO-optimized, mobile-responsive marketing catalog showcasing physical land developments, legal credentials, and direct lead generation.

MERN Stack Portal (portal.gwealthnation.com): A custom, secure backend application for realtor registrations, commission tracking, sales logs, and admin content distribution.

Automated One-Way Sync Engine: An API-driven connector where admin updates inside the MERN portal instantly push structural data to WordPress, leaving the customer-facing frontend fast, lightweight, and isolated from portal server loads.

2. High-Level System Architecture

                  ┌────────────────────────────────────────┐
                  │          MERN Admin Portal             │
                  │       (portal.gwealthnation.com)       │
                  └───────────────────┬────────────────────┘
                                      │
                   1. Admin uploads property text & media
                                      │
                                      ▼
                      ┌──────────────────────────────┐
                      │    Express API Backend       │
                      │   & MongoDB Database State   │
                      └───────┬──────────────┬───────┘
                              │              │
        2. Media uploaded     │              │ 3. Secure REST API Push
        to Cloudinary CDN     │              │    (WP Application PW)
                              ▼              ▼
                    ┌────────────┐    ┌──────────────────────────────┐
                    │ Cloudinary │    │      WordPress Database      │
                    │ Media CDN  │    │      (gwealthnation.com)     │
                    └──────┬─────┘    └──────────────┬───────────────┘
                           │                         │
                           │ 4. Asset URL            │ 5. Display HTML
                           └───────────┬─────────────┘
                                       │
                                       ▼
                  ┌────────────────────────────────────────┐
                  │         WordPress Frontend             │
                  │   (Fast, SEO-Optimized, Safe, Caching) │
                  └────────────────────────────────────────┘


3. Brand Identity & Trust Verification Guidelines

To eliminate confusion with micro-savings or food contribution programs, the platform must adhere to strict branding rules on the WordPress Frontend:

Identity Shield Banner: A permanent, clean warning disclaimer in the website footer and on top of the About page:

"G-Wealth Republic (GWealth Properties) is a registered real estate and land development firm. We do not run daily food contributions, micro-finance schemes, or cooperative savings programs."

Corporate Transparency Card: Bold display of the Corporate Affairs Commission (CAC) Registration Numbers, legal land surveys, and certifications on both the Homepage and the Realtor registration screen to build immediate trust.

Property Focus: Avoid using vague terms like "contributions", "empowerment plans", or "financial cycles". Use concrete real estate terms: "Plot Outright Purchase", "Layout Installment Plans", "Registered Site Surveys".

4. Functional Requirements

4.1. WordPress Marketing Website (gwealthnation.com)

Homepage:

Hero section emphasizing land ownership in key Southern/Eastern economic zones (Aba, Asaba, Port Harcourt).

Brand Verification module displaying legal land titles (C of O, Registered Survey).

Direct CTAs: "View Available Lands" and "Become a Partner Realtor".

Property Listings Hub (Dynamic Custom Post Type):

Displays land layouts (e.g., Wealth Kingdom Estate Phase 3, Akirika, Opobo Road Axis, Ukwa).

Search and filter systems: Filter by Location (Aba, Asaba, Port Harcourt, Abuja, Anambra), Price Range, and Title Status.

Pricing tags prominently displayed (e.g., "$\text{₦}550\text{k}/\text{Plot}$ - All-Inclusive").

Excursion / Site Inspection Booking Form: A simple floating/sticky booking form embedded on every property page allowing users to pick a physical inspection date.

Lead Integration:

Floating Responsive WhatsApp Trigger: Sticky mobile action button routing directly to localized offices (Aba Hotline or Asaba Desk depending on user selection).

Realtor Gateway:

A highlighted navigational button: "Realtor Portal Login" which redirects securely to portal.gwealthnation.com.

4.2. MERN Realtor Portal (portal.gwealthnation.com)

Realtor Registration & Authentication:

Sign-up form requiring full name, phone number, location, bank account details (for commission payouts), and referee/upline code (optional).

Account approval system: Registered accounts enter a "Pending Approval" state until verified by an Admin.

Realtor Dashboard:

The Wallet: Display of total earnings, paid commissions, and pending/unpaid commissions.

Downline Network Tracker: Tree-view or grid displaying other marketers registered via their referral code.

Marketing Media Hub: A highly organized folder layout populated by the Admin where realtors can view and download high-resolution marketing flyers, site layout maps, and compressed site walkthrough videos to share directly on WhatsApp and social media.

4.3. MERN Admin Control Panel

Realtor Verification Panel: Approval/rejection system for new registering realtors, and bank details confirmation.

Sales & Commission Logger:

Interface to record a new land transaction.

Inputs: Property sold, buyer info, closing price, primary selling realtor, and commission payout structure (e.g., $10\%$ direct commission, $2\%$ indirect downline commission).

Unified Property & Media Manager:

Form fields to upload a new estate listing.

Integration with Cloudinary API to upload, compress, and host heavy promotional videos and photos.

WP Sync Engine Switch: An active checkbox: "Publish live to gwealthnation.com website automatically".

5. The Sync Protocol (MERN $\rightarrow$ WordPress)

To maintain absolute stability and ensure WordPress updates never break the system, we use a Decoupled REST API Push Model utilizing WordPress Application Passwords.

5.1. Data Mapping

MERN MongoDB Property Field

Custom WordPress ACF Field

WordPress Post Target

propertyName (String)

post_title

Native Post Title

description (Markdown/HTML)

post_content

Native Post Body

pricePerPlot (Number)

property_price

Custom Field (ACF)

location (String Enum)

property_location

Custom Field / Taxonomy

titleType (String)

property_title_type

Custom Field (ACF)

cloudinaryVideoUrl (String)

property_video_embed

Custom Field (ACF)

cloudinaryImages (Array)

property_gallery

Custom Field (ACF)

wpPostId (Number)

N/A (Stored in MongoDB)

Identifies post for future edits

5.2. Post-Creation & Edit Flow Sequence

[Admin Saves Property in MERN]
       │
       ▼
[MERN Backend saves to MongoDB] ──► Generates local _id
       │
       ▼
[MERN Backend calls WordPress REST API via HTTP POST]
   URL: https://gwealthnation.com/wp-json/wp/v2/properties
   Auth: Basic Auth Header containing WP Application Password
       │
       ▼
[WordPress creates the custom post and maps fields via ACF]
       │
       ▼
[WordPress returns HTTP 201 Created with JSON containing "id"]
       │
       ▼
[MERN Backend updates MongoDB document with { wpPostId: id }]


6. System User Flows

Flow 1: Property Buyer Journey (Discovery to Conversion)

[User lands on gwealthnation.com]
       │
       ├─► [Sees Trust Disclaimer / Brand Integrity Banner]
       │
       ├─► [Clicks "Available Properties"]
       │     │
       │     ▼
       │   [Filters: Location "Aba", Price "< 1 Million"]
       │     │
       │     ▼
       │   [Selects "Wealth Kingdom Estate Phase 3"]
       │     │
       │     ├─► [Watches CDN-hosted site drone walkthrough video]
       │     │
       │     ├─► [Clicks "Book Free Physical Site Inspection"]
       │     │     └─► Fills form (Name, Phone, Preferred Date)
       │     │           └─► Sends Email/SMS notification to Admin
       │     │
       │     └─► [Clicks Floating WhatsApp Button]
       │           └─► Launches WhatsApp pre-filled with:
       │               "Hello G-Wealth, I want to book an inspection for Wealth Kingdom Phase 3."


Flow 2: Realtor Registration and Commission Cycle

[Realtor visits portal.gwealthnation.com]
       │
       ├─► [Completes registration form + bank details + inputs referrer code]
       │
       ├─► [Status set to PENDING verification]
       │
       ├─► [Admin reviews & approves realtor in admin panel]
       │
       ├─► [Realtor logs in to Dashboard]
       │     ├─► [Views personalized Referral Code]
       │     ├─► [Enters Marketing Media Hub]
       │     └─► [Downloads compressed promo video + plot maps to share on WhatsApp]
       │
       ├─► [Realtor closes a sale offline]
       │     │
       │     ▼
       │   [Admin logs sale in Admin Panel]
       │     ├─► Associates sale with Realtor ID
       │     ├─► System automatically computes commission:
       │     │     ├── Direct Selling Realtor: 10% (Credited to Wallet)
       │     │     └── Upline Realtor (if exists): 2% (Credited to Wallet)
       │     │
       │     ▼
       │   [Realtor sees wallet update in real-time]
       │     │
       │     ▼
       │   [Realtor clicks "Request Payout"]
       │     └─► Admin receives payout request ──► Pays to registered Bank ──► Marks as PAID


7. Database Schemas (MERN Backend MongoDB State)

To ensure clear tracking of realtors, properties, and payouts, the MERN database will host the following four main collections:

7.1. User Schema (Realtors & Admins)

{
  "_id": "ObjectId('60c72b2f9b1d8b2bad0343a1')",
  "fullName": "Chinedu Okeke",
  "email": "chinedu@gwealthrealtor.com",
  "phone": "+2348030000000",
  "role": "realtor", // ['realtor', 'admin']
  "status": "approved", // ['pending', 'approved', 'suspended']
  "referralCode": "GW-CHINEDU-80",
  "referredBy": "GW-SPONSOR-12",
  "bankDetails": {
    "bankName": "Access Bank",
    "accountNumber": "0123456789",
    "accountName": "Chinedu Okeke"
  },
  "createdAt": "2026-07-09T10:00:00Z"
}


7.2. Property Schema

{
  "_id": "ObjectId('60c72b2f9b1d8b2bad0343a2')",
  "propertyName": "Wealth Kingdom Estate Phase 3",
  "location": "Aba", // ['Aba', 'Asaba', 'Port Harcourt', 'Abuja', 'Anambra']
  "pricePerPlot": 550000,
  "titleType": "Registered Survey & Power of Attorney",
  "cloudinaryVideoUrl": "https://res.cloudinary.com/gwealth/video/upload/v123456/wk3_drone.mp4",
  "cloudinaryImages": [
    "https://res.cloudinary.com/gwealth/image/upload/v123456/wk3_flyer.jpg"
  ],
  "wpPostId": 412, // Stored to run target API edits/deletions on WordPress
  "createdAt": "2026-07-09T10:15:00Z"
}


7.3. Commission Ledger Schema

{
  "_id": "ObjectId('60c72b2f9b1d8b2bad0343a3')",
  "propertyId": "ObjectId('60c72b2f9b1d8b2bad0343a2')",
  "salePrice": 550000,
  "buyerName": "Amaka Johnson",
  "directRealtorId": "ObjectId('60c72b2f9b1d8b2bad0343a1')",
  "directCommissionAmount": 55000, // 10%
  "uplineRealtorId": "ObjectId('60c72b2f9b1d8b2bad0343a9')",
  "uplineCommissionAmount": 11000, // 2%
  "payoutStatus": "pending", // ['pending', 'paid']
  "loggedBy": "ObjectId('60c72b2f9b1d8b2bad0343aa')",
  "createdAt": "2026-07-09T11:30:00Z"
}


8. Absolute Stability Guardrails (Preventing Future Breakdowns)

To ensure your web systems survive future server scaling, third-party plugin updates, and high traffic, the developers must enforce these rules:

No External Dependency Chains: Do not use third-party WordPress real-estate plugins to manage the properties database. Use WordPress custom post types (CPTs) combined with ACF. Since ACF is owned and backed by enterprise systems, its API schema remains virtually unchanged over time, keeping the sync engine healthy forever.

Asynchronous API Error-Handling (The Fail-Safe Queue): If your admin saves a property inside the MERN panel and the WordPress server happens to be temporarily down for updates, the MERN server must not crash. The Node.js API must capture the error and schedule a background cron job to retry syncing the item to WordPress every $30\text{ minutes}$ until successful.

Bandwidth Preservation (The Video Rule):
Site walkthrough videos must never be uploaded directly to WordPress or MongoDB servers. Raw 4K or 1080p footage filmed at Aba or Asaba sites will deplete host storage instantly and slow down page performance. The system must pipeline all videos through Cloudinary's automatic optimization API, compressing them down for 3G/4G mobile viewing before passing the optimized link to the platforms.