import { db, pool } from "@workspace/db";
import { communities } from "@workspace/db/schema";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATE_COORDS: Record<string, [number, number]> = {
  AL: [32.806671, -86.79113], AK: [61.370716, -152.404419], AZ: [33.729759, -111.431221],
  AR: [34.969704, -92.373123], CA: [36.116203, -119.681564], CO: [39.059811, -105.311104],
  CT: [41.597782, -72.755371], DE: [39.318523, -75.507141], DC: [38.897438, -77.026817],
  FL: [27.766279, -81.686783], GA: [33.040619, -83.643074], HI: [21.094318, -157.498337],
  ID: [44.240459, -114.478773], IL: [40.349457, -88.986137], IN: [39.849426, -86.258278],
  IA: [42.011539, -93.210526], KS: [38.526600, -96.726486], KY: [37.668140, -84.670067],
  LA: [31.169546, -91.867805], ME: [44.693947, -69.381927], MD: [39.063946, -76.802101],
  MA: [42.230171, -71.530106], MI: [43.326618, -84.536095], MN: [45.694454, -93.900192],
  MS: [32.741646, -89.678696], MO: [38.456085, -92.288368], MT: [46.921925, -110.454353],
  NE: [41.125370, -98.268082], NV: [38.313515, -117.055374], NH: [43.452492, -71.563896],
  NJ: [40.298904, -74.521011], NM: [34.840515, -106.248482], NY: [42.165726, -74.948051],
  NC: [35.630066, -79.806419], ND: [47.528912, -99.784012], OH: [40.388783, -82.764915],
  OK: [35.565342, -96.928917], OR: [44.572021, -122.070938], PA: [40.590752, -77.209755],
  RI: [41.680893, -71.511780], SC: [33.856892, -80.945007], SD: [44.299782, -99.438828],
  TN: [35.747845, -86.692345], TX: [31.054487, -97.563461], UT: [40.150032, -111.862434],
  VT: [44.045876, -72.710686], VA: [37.769337, -78.169968], WA: [47.400902, -121.490494],
  WV: [38.491226, -80.954456], WI: [44.268543, -89.616508], WY: [42.755966, -107.302490],
  AS: [-14.270972, -170.132217], GU: [13.444304, 144.793731], MP: [15.0979, 145.6739],
  PR: [18.220833, -66.590149], VI: [18.335765, -64.896335],
};

function getCountySuffix(state: string, countyName: string): string {
  if (state === "LA") return "Parish";
  if (state === "AK" && countyName.includes("Borough")) return "Borough";
  if (state === "AK" && countyName.includes("Census Area")) return "Census Area";
  if (state === "AK" && countyName === "Municipality of Anchorage") return "";
  return "County";
}

function parseCountyName(rawName: string, state: string): { name: string; displayName: string } {
  let name = rawName.trim();

  const suffixes = [" County", " Parish", " Borough", " Census Area", " Municipality", " city", " City and Borough", " City and County"];
  let suffix = "";
  for (const s of suffixes) {
    if (name.endsWith(s)) {
      name = name.slice(0, -s.length);
      suffix = s.trim();
      break;
    }
  }

  if (rawName.includes("Municipality of")) {
    name = rawName.replace("Municipality of ", "").trim();
  }

  let displayName: string;
  if (state === "LA") {
    displayName = `${name} Parish, ${state}`;
  } else if (state === "AK" && rawName.includes("Borough")) {
    displayName = `${name} Borough, ${state}`;
  } else if (state === "AK" && rawName.includes("Census Area")) {
    displayName = `${name} Census Area, ${state}`;
  } else if (rawName.includes("city") && state === "VA") {
    displayName = `${name}, ${state}`;
  } else if (rawName.includes("City and Borough")) {
    displayName = `${name}, ${state}`;
  } else if (rawName.includes("City and County")) {
    displayName = `${name}, ${state}`;
  } else {
    displayName = `${name} County, ${state}`;
  }

  return { name, displayName };
}

async function seedCounties() {
  console.log("Seeding US counties into communities table...");

  const existingCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(communities);
  const currentCount = existingCount[0].count;

  if (currentCount > 3000) {
    console.log(`Communities table already has ${currentCount} rows. Skipping county seed.`);
    return;
  }

  const filePath = path.join(__dirname, "../data/national_county2020.txt");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const lines = fileContent.trim().split("\n");

  const counties: {
    name: string;
    state: string;
    displayName: string;
    fipsCode: string;
    isCounty: boolean;
    isCustom: boolean;
    latitude: string;
    longitude: string;
    status: "active";
  }[] = [];

  const seenFips = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split("|");
    if (parts.length < 6) continue;

    const stateAbbr = parts[0].trim();
    const stateFp = parts[1].trim();
    const countyFp = parts[2].trim();
    const rawCountyName = parts[4].trim();
    const fipsCode = `${stateFp}${countyFp}`;

    if (seenFips.has(fipsCode)) continue;
    seenFips.add(fipsCode);

    const { name, displayName } = parseCountyName(rawCountyName, stateAbbr);

    const stateCoords = STATE_COORDS[stateAbbr] || [0, 0];
    const latOffset = (parseInt(countyFp, 10) % 100) * 0.02 - 1;
    const lonOffset = (parseInt(countyFp, 10) % 73) * 0.03 - 1.1;
    const lat = (stateCoords[0] + latOffset).toFixed(6);
    const lon = (stateCoords[1] + lonOffset).toFixed(6);

    counties.push({
      name,
      state: stateAbbr,
      displayName,
      fipsCode,
      isCounty: true,
      isCustom: false,
      latitude: lat,
      longitude: lon,
      status: "active",
    });
  }

  console.log(`Parsed ${counties.length} counties from FIPS data`);

  const BATCH_SIZE = 500;
  for (let i = 0; i < counties.length; i += BATCH_SIZE) {
    const batch = counties.slice(i, i + BATCH_SIZE);
    await db.insert(communities).values(batch);
    console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} rows)`);
  }

  const finalCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(communities);
  console.log(`County seeding complete! Total communities: ${finalCount[0].count}`);
}

seedCounties()
  .then(() => pool.end())
  .catch((err) => {
    console.error("County seed failed:", err);
    pool.end();
    process.exit(1);
  });
