import { prisma } from "../config/db.js";
import { HotelModel } from "./hotel.model.js";

const HOTELS = [
    {
        "id": "hotel-0001-uuid",
        "name": "The Royal Orchid Luxury Resort",
        "description": "A 5-star premium luxury resort offering world-class amenities, breathtaking views, curated dining experiences, and personalized hospitality.",
        "rating": 4.7,
        "is_featured": true,
        "price": 186,
        "reviewCount": 5,
        "location": {
          "address": "45 Beach View Road",
          "area": "Palm Coast",
          "city": "Miami",
          "state": "FL",
          "postal_code": "33101",
          "country": "USA",
          "geo": { "lat": 25.7617, "lng": -80.1918 },
          "nearby_landmarks": [
            { "name": "Miami Beach", "distance_km": 1.2 },
            { "name": "Convention Center", "distance_km": 3.8 }
          ]
        },
        "images": [
          { "url": "/uploads/hotels/royal_orchid/cover.jpg", "alt": "Hotel Entrance" },
          { "url": "/uploads/hotels/royal_orchid/lobby.jpg", "alt": "Grand Lobby" },
          { "url": "/uploads/hotels/royal_orchid/pool.jpg", "alt": "Outdoor Pool" }
        ],
        "tags": ["Luxury", "Beachfront", "Family Friendly", "Business Travel"],
        "policies": {
          "check_in": "14:00",
          "check_out": "11:00",
          "child_policy": "Children below 5 stay free.",
          "pet_policy": "Pets under 10kg allowed with an additional fee.",
          "smoking_policy": "Smoking only in designated areas."
        },
        "contact": {
          "phone": "+1 305-912-5678",
          "email": "info@royalorchidresort.com",
          "website": "https://royalorchidresort.com"
        },
        "amenities": [
          { "id": 1, "title": "Swimming Pool", "icon": "pool.svg" },
          { "id": 2, "title": "Free Wi-Fi", "icon": "wifi.svg" },
          { "id": 3, "title": "Spa & Massage", "icon": "spa.svg" },
          { "id": 4, "title": "Fitness Center", "icon": "gym.svg" }
        ],
        "services": {
          "parking": { "available": true, "type": "valet", "fee": 20 },
          "breakfast": { "included": false, "price_per_person": 25 },
          "airport_pickup": { "available": true, "fee": 40 },
          "laundry": { "available": true, "charge_type": "per_item" }
        },
        "rooms": [
          {
            "id": "room-001-deluxe",
            "title": "Deluxe King Room",
            "description": "Spacious deluxe room with a king-size bed and balcony.",
            "capacity_adults": 2,
            "capacity_children": 1,
            "base_price": 210,
            "quantity": 12,
            "size_sqft": 380,
            "beds": [{ "type": "King", "count": 1 }],
            "view": "City View",
            "air_conditioned": true,
            "amenities": ["Smart TV", "Mini Fridge", "Work Desk"],
            "images": [
              { "url": "/uploads/rooms/deluxe/1.jpg" },
              { "url": "/uploads/rooms/deluxe/2.jpg" }
            ],
            "addons": [
              { "id": "addon-breakfast", "title": "Breakfast Included", "price": 25, "type": "per_person" }
            ]
          },
          {
            "id": "room-002-suite",
            "title": "Executive Suite",
            "description": "Luxury suite with ocean view, private lounge space, and premium amenities.",
            "capacity_adults": 3,
            "capacity_children": 2,
            "base_price": 420,
            "quantity": 6,
            "size_sqft": 620,
            "beds": [{ "type": "King", "count": 1 }],
            "view": "Ocean View",
            "air_conditioned": true,
            "amenities": ["Jacuzzi", "Smart TV", "Kitchenette", "Balcony"],
            "images": [{ "url": "/uploads/rooms/suite/1.jpg" }],
            "addons": [
              { "id": "addon-airport", "title": "Airport Pickup", "price": 40, "type": "fixed" }
            ]
          },
          {
            "id": "room-003-standard",
            "title": "Standard Double Room",
            "description": "Comfortable room with essential amenities and a modern interior.",
            "capacity_adults": 2,
            "capacity_children": 1,
            "base_price": 160,
            "quantity": 15,
            "size_sqft": 300,
            "beds": [{ "type": "Double", "count": 2 }],
            "view": "Garden View",
            "air_conditioned": true,
            "amenities": ["Flat TV", "Mini Bar"],
            "images": [{ "url": "/uploads/rooms/standard/1.jpg" }],
            "addons": []
          }
        ],
        "reviews": [
          {
            "id": "rev-001",
            "user_name": "John D.",
            "rating": 5,
            "comment": "Amazing stay, super clean rooms and friendly staff.",
            "date": "2025-01-10"
          },
          {
            "id": "rev-002",
            "user_name": "Emily R.",
            "rating": 4,
            "comment": "Great location but breakfast was a bit expensive.",
            "date": "2025-02-14"
          }
        ]
    },
    {
    "id": "hotel-0002-uuid",
    "name": "The Grand Sapphire Hotel",
    "description": "A sophisticated urban luxury hotel located in the heart of Manhattan, offering elegant rooms, skyline views, fine dining, and premium services.",
    "rating": 4.6,
    "is_featured": true,
    "price": 165,
    "reviewCount": 52,
    "location": {
        "address": "120 Madison Avenue",
        "area": "Midtown",
        "city": "New York",
        "state": "NY",
        "postal_code": "10016",
        "country": "USA",
        "geo": { "lat": 40.7484, "lng": -73.9857 },
        "nearby_landmarks": [
        { "name": "Empire State Building", "distance_km": 0.4 },
        { "name": "Times Square", "distance_km": 1.2 }
        ]
    },
    "images": [
        { "url": "/uploads/hotels/sapphire/cover.jpg", "alt": "Hotel Front" },
        { "url": "/uploads/hotels/sapphire/lobby.jpg", "alt": "Luxury Lobby" },
        { "url": "/uploads/hotels/sapphire/restaurant.jpg", "alt": "Fine Dining" }
    ],
    "tags": ["Luxury", "Business Travel", "City Center"],
    "policies": {
        "check_in": "15:00",
        "check_out": "11:00",
        "child_policy": "Children below 6 stay free.",
        "pet_policy": "Pets under 12kg allowed with a fee.",
        "smoking_policy": "Non-smoking property."
    },
    "contact": {
        "phone": "+1 212-500-8123",
        "email": "info@grandsapphire.com",
        "website": "https://grandsapphire.com"
    },
    "amenities": [
        { "id": 1, "title": "Free Wi-Fi", "icon": "wifi.svg" },
        { "id": 2, "title": "Fitness Center", "icon": "gym.svg" },
        { "id": 3, "title": "Bar & Lounge", "icon": "bar.svg" }
    ],
    "services": {
        "parking": { "available": false, "type": "none", "fee": 0 },
        "breakfast": { "included": false, "price_per_person": 30 },
        "airport_pickup": { "available": true, "fee": 60 },
        "laundry": { "available": true, "charge_type": "per_item" }
    },
    "rooms": [
        {
        "id": "room-101-deluxe",
        "title": "Deluxe Queen Room",
        "description": "Modern room with a queen bed and city view.",
        "capacity_adults": 2,
        "capacity_children": 1,
        "base_price": 250,
        "quantity": 18,
        "size_sqft": 320,
        "beds": [{ "type": "Queen", "count": 1 }],
        "view": "Skyline View",
        "air_conditioned": true,
        "amenities": ["Smart TV", "Mini Bar"],
        "images": [{ "url": "/uploads/rooms/ny_deluxe/1.jpg" }],
        "addons": []
        },
        {
        "id": "room-102-suite",
        "title": "Penthouse Suite",
        "description": "Premium penthouse with a private terrace and spectacular skyline views.",
        "capacity_adults": 4,
        "capacity_children": 2,
        "base_price": 700,
        "quantity": 2,
        "size_sqft": 900,
        "beds": [{ "type": "King", "count": 1 }],
        "view": "Skyline View",
        "air_conditioned": true,
        "amenities": ["Jacuzzi", "Mini Bar", "Private Lounge"],
        "images": [{ "url": "/uploads/rooms/ny_suite/1.jpg" }],
        "addons": [
            { "id": "addon-limo", "title": "Private Limousine", "price": 120, "type": "fixed" }
        ]
        }
    ],
    "reviews": [
        {
        "id": "rev-201",
        "user_name": "Michael S.",
        "rating": 5,
        "comment": "Outstanding service and top-class rooms.",
        "date": "2025-01-05"
        },
        {
        "id": "rev-202",
        "user_name": "Anna L.",
        "rating": 4,
        "comment": "Great location but rooms are a bit small.",
        "date": "2025-02-02"
        }
    ]
    },
    {
    "id": "hotel-0003-uuid",
    "name": "Oceanview Paradise Resort",
    "description": "A scenic beachfront getaway offering premium villas, sunset dining, tropical gardens, and a relaxing vacation experience.",
    "rating": 4.8,
    "is_featured": true,
    "price": 136,
    "reviewCount": 8,
    "location": {
        "address": "280 Sunset Boulevard",
        "area": "Pacific Coast",
        "city": "Los Angeles",
        "state": "CA",
        "postal_code": "90049",
        "country": "USA",
        "geo": { "lat": 34.0522, "lng": -118.2437 },
        "nearby_landmarks": [
        { "name": "Santa Monica Pier", "distance_km": 4.2 },
        { "name": "Venice Beach", "distance_km": 6.8 }
        ]
    },
    "images": [
        { "url": "/uploads/hotels/oceanview/cover.jpg", "alt": "Resort Entrance" },
        { "url": "/uploads/hotels/oceanview/beach.jpg", "alt": "Beach" }
    ],
    "tags": ["Beachfront", "Resort", "Couples", "Family Friendly"],
    "policies": {
        "check_in": "14:00",
        "check_out": "11:00",
        "child_policy": "Kids under 7 stay free.",
        "pet_policy": "Pets not allowed.",
        "smoking_policy": "Smoking allowed only outdoors."
    },
    "contact": {
        "phone": "+1 323-900-5522",
        "email": "info@oceanviewparadise.com",
        "website": "https://oceanviewparadise.com"
    },
    "amenities": [
        { "id": 1, "title": "Beach Access", "icon": "beach.svg" },
        { "id": 2, "title": "Swimming Pool", "icon": "pool.svg" },
        { "id": 3, "title": "Spa & Wellness", "icon": "spa.svg" }
    ],
    "services": {
        "parking": { "available": true, "type": "self", "fee": 15 },
        "breakfast": { "included": true, "price_per_person": 0 },
        "airport_pickup": { "available": true, "fee": 50 },
        "laundry": { "available": true, "charge_type": "per_item" }
    },
    "rooms": [
        {
        "id": "room-301-villa",
        "title": "Oceanfront Villa",
        "description": "Private villa with direct beach access and a private deck.",
        "capacity_adults": 2,
        "capacity_children": 2,
        "base_price": 450,
        "quantity": 10,
        "size_sqft": 700,
        "beds": [{ "type": "King", "count": 1 }],
        "view": "Ocean View",
        "air_conditioned": true,
        "amenities": ["Deck", "Smart TV", "Mini Bar"],
        "images": [{ "url": "/uploads/rooms/la_villa/1.jpg" }],
        "addons": []
        }
    ],
    "reviews": [
        {
        "id": "rev-301",
        "user_name": "Sarah W.",
        "rating": 5,
        "comment": "Best beach resort I've ever visited!",
        "date": "2025-03-01"
        }
    ]
    },      
    {
    "id": "hotel-0004-uuid",
    "name": "Mountain Crest Retreat",
    "description": "A peaceful mountain escape featuring panoramic views, hiking trails, cozy cabins, and nature-centric activities.",
    "rating": 4.5,
    "is_featured": false,
    "price": 150,
    "reviewCount": 12,
    "location": {
        "address": "990 Alpine Road",
        "area": "Rocky Heights",
        "city": "Denver",
        "state": "CO",
        "postal_code": "80202",
        "country": "USA",
        "geo": { "lat": 39.7392, "lng": -104.9903 },
        "nearby_landmarks": [
        { "name": "Rocky Mountain Park", "distance_km": 12 },
        { "name": "Denver Botanical Gardens", "distance_km": 4.6 }
        ]
    },
    "images": [
        { "url": "/uploads/hotels/mountain/cover.jpg", "alt": "Mountain View" }
    ],
    "tags": ["Nature", "Adventure", "Retreat"],
    "policies": {
        "check_in": "13:00",
        "check_out": "10:00",
        "child_policy": "Children of all ages welcome.",
        "pet_policy": "Pets allowed with a fee.",
        "smoking_policy": "Smoking not allowed indoors."
    },
    "contact": {
        "phone": "+1 720-812-7744",
        "email": "info@mountaincrest.com",
        "website": "https://mountaincrest.com"
    },
    "amenities": [
        { "id": 1, "title": "Hiking Trails", "icon": "hiking.svg" },
        { "id": 2, "title": "Fireplace", "icon": "fireplace.svg" }
    ],
    "services": {
        "parking": { "available": true, "type": "self", "fee": 0 },
        "breakfast": { "included": false, "price_per_person": 20 },
        "airport_pickup": { "available": false, "fee": 0 },
        "laundry": { "available": false, "charge_type": "none" }
    },
    "rooms": [
        {
        "id": "room-401-cabin",
        "title": "Premium Cabin",
        "description": "Rustic cabin with fireplace and mountain view.",
        "capacity_adults": 3,
        "capacity_children": 1,
        "base_price": 180,
        "quantity": 8,
        "size_sqft": 450,
        "beds": [{ "type": "Queen", "count": 1 }],
        "view": "Mountain View",
        "air_conditioned": false,
        "amenities": ["Fireplace", "Kitchenette"],
        "images": [{ "url": "/uploads/rooms/cabin/1.jpg" }],
        "addons": []
        }
    ],
    "reviews": [
        {
        "id": "rev-401",
        "user_name": "Jacob M.",
        "rating": 4,
        "comment": "Great cabins but a bit far from town.",
        "date": "2025-02-28"
        }
    ]
    },
    {
    "id": "hotel-0005-uuid",
    "name": "The Lakeside Serenity Hotel",
    "description": "A tranquil lakefront hotel offering modern rooms, waterfront dining, and a peaceful vacation atmosphere.",
    "rating": 4.4,
    "is_featured": false,
    "price": 120,
    "reviewCount": 24,
    "location": {
        "address": "550 Lakeview Drive",
        "area": "Green Lake",
        "city": "Seattle",
        "state": "WA",
        "postal_code": "98103",
        "country": "USA",
        "geo": { "lat": 47.6062, "lng": -122.3321 },
        "nearby_landmarks": [
        { "name": "Green Lake Park", "distance_km": 0.5 },
        { "name": "Seattle Zoo", "distance_km": 2.1 }
        ]
    },
    "images": [
        { "url": "/uploads/hotels/lakeside/cover.jpg", "alt": "Lakeside View" }
    ],
    "tags": ["Lakefront", "Relaxation", "Family Friendly"],
    "policies": {
        "check_in": "14:00",
        "check_out": "11:00",
        "child_policy": "Kids under 6 stay free.",
        "pet_policy": "Small pets allowed.",
        "smoking_policy": "Non-smoking hotel."
    },
    "contact": {
        "phone": "+1 206-900-5411",
        "email": "info@lakesideserenity.com",
        "website": "https://lakesideserenity.com"
    },
    "amenities": [
        { "id": 1, "title": "Free Wi-Fi", "icon": "wifi.svg" },
        { "id": 2, "title": "Restaurant", "icon": "restaurant.svg" }
    ],
    "services": {
        "parking": { "available": true, "type": "self", "fee": 10 },
        "breakfast": { "included": false, "price_per_person": 18 },
        "airport_pickup": { "available": false, "fee": 0 },
        "laundry": { "available": true, "charge_type": "per_item" }
    },
    "rooms": [
        {
        "id": "room-501-standard",
        "title": "Standard Lake View Room",
        "description": "Cozy room with a stunning lake view.",
        "capacity_adults": 2,
        "capacity_children": 1,
        "base_price": 150,
        "quantity": 20,
        "size_sqft": 280,
        "beds": [{ "type": "Queen", "count": 1 }],
        "view": "Lake View",
        "air_conditioned": true,
        "amenities": ["Smart TV", "Mini Bar"],
        "images": [{ "url": "/uploads/rooms/lake_standard/1.jpg" }],
        "addons": []
        }
    ],
    "reviews": [
        {
        "id": "rev-501",
        "user_name": "Linda T.",
        "rating": 5,
        "comment": "Beautiful view and peaceful atmosphere.",
        "date": "2025-03-10"
        }
    ]
    }
];

async function seedHotels() {
  try {
    if (!HOTELS.length) {
      console.log("No hotels defined in HOTELS array. Add some entries first.");
      return;
    }

    const created = await HotelModel.bulkCreate(HOTELS);
    console.log(`✅ Seeded ${created.length} hotel(s) into the "hotels" table.`);
  } catch (err) {
    console.error("❌ Error seeding hotels:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seedHotels();


