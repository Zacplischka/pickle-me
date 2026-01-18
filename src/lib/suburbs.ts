export interface SuburbBounds {
  name: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

// Melbourne suburbs with approximate bounding boxes
export const MELBOURNE_SUBURBS: SuburbBounds[] = [
  { name: "Melbourne CBD", minLat: -37.825, maxLat: -37.805, minLng: 144.945, maxLng: 144.975 },
  { name: "Richmond", minLat: -37.83, maxLat: -37.815, minLng: 144.985, maxLng: 145.01 },
  { name: "South Yarra", minLat: -37.855, maxLat: -37.835, minLng: 144.98, maxLng: 145.01 },
  { name: "St Kilda", minLat: -37.875, maxLat: -37.855, minLng: 144.965, maxLng: 144.995 },
  { name: "Carlton", minLat: -37.805, maxLat: -37.79, minLng: 144.955, maxLng: 144.975 },
  { name: "Fitzroy", minLat: -37.795, maxLat: -37.78, minLng: 144.975, maxLng: 144.995 },
  { name: "Collingwood", minLat: -37.805, maxLat: -37.79, minLng: 144.985, maxLng: 145.005 },
  { name: "Brunswick", minLat: -37.775, maxLat: -37.755, minLng: 144.955, maxLng: 144.975 },
  { name: "Northcote", minLat: -37.775, maxLat: -37.755, minLng: 144.99, maxLng: 145.01 },
  { name: "Hawthorn", minLat: -37.835, maxLat: -37.815, minLng: 145.02, maxLng: 145.05 },
  { name: "Camberwell", minLat: -37.845, maxLat: -37.825, minLng: 145.055, maxLng: 145.085 },
  { name: "Prahran", minLat: -37.855, maxLat: -37.84, minLng: 144.99, maxLng: 145.015 },
  { name: "South Melbourne", minLat: -37.845, maxLat: -37.83, minLng: 144.95, maxLng: 144.975 },
  { name: "Port Melbourne", minLat: -37.845, maxLat: -37.83, minLng: 144.92, maxLng: 144.95 },
  { name: "Footscray", minLat: -37.805, maxLat: -37.785, minLng: 144.885, maxLng: 144.915 },
  { name: "Essendon", minLat: -37.765, maxLat: -37.745, minLng: 144.9, maxLng: 144.93 },
  { name: "Preston", minLat: -37.755, maxLat: -37.735, minLng: 144.99, maxLng: 145.02 },
  { name: "Heidelberg", minLat: -37.765, maxLat: -37.745, minLng: 145.05, maxLng: 145.08 },
  { name: "Box Hill", minLat: -37.825, maxLat: -37.805, minLng: 145.115, maxLng: 145.145 },
  { name: "Glen Waverley", minLat: -37.885, maxLat: -37.865, minLng: 145.155, maxLng: 145.185 },
  { name: "Dandenong", minLat: -37.995, maxLat: -37.975, minLng: 145.205, maxLng: 145.235 },
  { name: "Frankston", minLat: -38.155, maxLat: -38.135, minLng: 145.115, maxLng: 145.145 },
  { name: "Brighton", minLat: -37.925, maxLat: -37.905, minLng: 144.98, maxLng: 145.01 },
  { name: "Elsternwick", minLat: -37.895, maxLat: -37.88, minLng: 144.995, maxLng: 145.015 },
  { name: "Caulfield", minLat: -37.885, maxLat: -37.87, minLng: 145.02, maxLng: 145.045 },
  { name: "Malvern", minLat: -37.87, maxLat: -37.855, minLng: 145.025, maxLng: 145.055 },
  { name: "Kew", minLat: -37.815, maxLat: -37.795, minLng: 145.025, maxLng: 145.055 },
  { name: "Balwyn", minLat: -37.815, maxLat: -37.795, minLng: 145.075, maxLng: 145.105 },
  { name: "Doncaster", minLat: -37.795, maxLat: -37.775, minLng: 145.115, maxLng: 145.145 },
  { name: "Templestowe", minLat: -37.775, maxLat: -37.755, minLng: 145.13, maxLng: 145.16 },
];

/**
 * Find the suburb name for a given lat/lng coordinate
 */
export function getSuburbForCoordinate(lat: number, lng: number): string | null {
  for (const suburb of MELBOURNE_SUBURBS) {
    if (
      lat >= suburb.minLat &&
      lat <= suburb.maxLat &&
      lng >= suburb.minLng &&
      lng <= suburb.maxLng
    ) {
      return suburb.name;
    }
  }
  return null;
}

/**
 * Melbourne bounding box for the heat map
 */
export const MELBOURNE_BOUNDS = {
  minLat: -38.1,
  maxLat: -37.5,
  minLng: 144.5,
  maxLng: 145.5,
};
