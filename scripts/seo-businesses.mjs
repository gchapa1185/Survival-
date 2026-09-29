// Business types that get a search landing page. Each needs a fictional
// example (name, city, specialty) for the sample plan. Names are invented;
// pages label them as fictional.
//
// The generator's templates read "running a {type}" and "Is {specialty} worth
// it?", so specialties are singular or mass nouns, and types that name a
// person (plumber, dentist) set genType to the business they run.

export const BUSINESSES = [
  { type: "bakery", plural: "bakeries", name: "Rise & Crumb", city: "San Antonio", specialty: "sourdough" },
  { type: "coffee shop", name: "Low Tide Coffee", city: "Portland", specialty: "cold brew" },
  { type: "cafe", name: "Corner Table Cafe", city: "Richmond", specialty: "brunch" },
  { type: "restaurant", name: "Olive & Ash", city: "Denver", specialty: "wood-fired cooking" },
  { type: "taco truck", name: "Tacos La Veinte", city: "Houston", specialty: "al pastor" },
  { type: "food truck", name: "Rolling Smoke", city: "Austin", specialty: "brisket" },
  { type: "pizza shop", name: "Slice Theory", city: "Chicago", specialty: "tavern-style pizza" },
  { type: "ice cream shop", name: "Two Scoops North", city: "Minneapolis", specialty: "small-batch ice cream" },
  { type: "brewery", plural: "breweries", name: "Hollow Oak Brewing", city: "Asheville", specialty: "craft beer" },
  { type: "bar", name: "The Quiet Pour", city: "Nashville", specialty: "mixology" },
  { type: "salon", name: "Studio Maple", city: "Charlotte", specialty: "balayage" },
  { type: "barbershop", name: "Straight Edge Barbers", city: "Atlanta", specialty: "beard grooming" },
  { type: "nail salon", name: "Polished Nail Bar", city: "Phoenix", specialty: "nail art" },
  { type: "spa", name: "Stillwater Day Spa", city: "Scottsdale", specialty: "massage therapy" },
  { type: "tattoo shop", name: "Ironline Tattoo", city: "Seattle", specialty: "fine-line tattooing" },
  { type: "gym", name: "Forge Strength Club", city: "Tampa", specialty: "strength training" },
  { type: "yoga studio", name: "Open Door Yoga", city: "Boulder", specialty: "hot yoga" },
  { type: "pilates studio", name: "Core & Form Pilates", city: "San Diego", specialty: "reformer pilates" },
  { type: "martial arts studio", name: "Blue Ridge Jiu-Jitsu", city: "Raleigh", specialty: "jiu-jitsu" },
  { type: "dance studio", name: "Step Forward Dance", city: "Columbus", specialty: "hip-hop dance" },
  { type: "florist", name: "Wild Stem Florals", city: "Savannah", specialty: "wedding floral design" },
  { type: "dentist", genType: "dental practice", name: "Brightside Dental", city: "Omaha", specialty: "teeth whitening" },
  { type: "chiropractor", genType: "chiropractic office", name: "Aligned Chiropractic", city: "Boise", specialty: "chiropractic care" },
  { type: "dog groomer", genType: "grooming salon", name: "Sudsy Paws Grooming", city: "Sacramento", specialty: "doodle grooming" },
  { type: "pet store", name: "Good Boy Supply", city: "Madison", specialty: "natural pet food" },
  { type: "plumber", genType: "plumbing company", name: "Clearline Plumbing", city: "Dallas", specialty: "water heater repair" },
  { type: "electrician", genType: "electrical company", name: "Brightwire Electric", city: "Kansas City", specialty: "EV charger installation" },
  { type: "HVAC company", plural: "HVAC companies", title: "HVAC Companies", name: "Coolpath Heating & Air", city: "Las Vegas", specialty: "AC repair" },
  { type: "roofer", genType: "roofing company", name: "Summit Roofing", city: "Oklahoma City", specialty: "roof repair" },
  { type: "landscaper", genType: "landscaping company", name: "Greenline Landscapes", city: "Orlando", specialty: "lawn care" },
  { type: "house cleaning service", name: "Fresh Nest Cleaning", city: "Charleston", specialty: "deep cleaning" },
  { type: "pressure washing business", plural: "pressure washing businesses", name: "Blast Off Washing", city: "Jacksonville", specialty: "driveway pressure washing" },
  { type: "auto shop", name: "Torque Auto Care", city: "Detroit", specialty: "brake repair" },
  { type: "car wash", plural: "car washes", name: "Shine Lane Car Wash", city: "Fort Worth", specialty: "ceramic coating" },
  { type: "realtor", genType: "real estate team", name: "Keystone Home Group", city: "Tucson", specialty: "home staging" },
  { type: "photographer", genType: "photography studio", name: "Golden Hour Studio", city: "Salt Lake City", specialty: "family portrait photography" },
  { type: "bookstore", name: "Dog-Eared Books", city: "Providence", specialty: "rare-book hunting" },
  { type: "boutique", name: "Juniper Lane Boutique", city: "Birmingham", specialty: "women's fashion" },
  { type: "thrift store", name: "Second Round Thrift", city: "Pittsburgh", specialty: "vintage clothing" },
  { type: "jewelry store", name: "Northstar Jewelers", city: "Louisville", specialty: "custom jewelry" },
  { type: "wedding planner", genType: "wedding planning company", name: "Ever After Events", city: "Napa", specialty: "vineyard wedding planning" },
];
