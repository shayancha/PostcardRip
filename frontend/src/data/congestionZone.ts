/**
 * NYC Congestion Relief Zone (CRZ) GeoJSON polygon.
 *
 * Covers Manhattan south of 60th Street (approx lat 40.764).
 * Coordinates derived from OpenStreetMap New York County boundary
 * (relation 2552485), clipped at the 60th Street latitude and filtered
 * to the Manhattan Island land area (excluding Governors Island and
 * county maritime boundaries).
 *
 * Winding: clockwise (GeoJSON exterior ring convention).
 * Coordinates are [longitude, latitude].
 */
export const CONGESTION_ZONE_GEOJSON: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: "Feature",
  properties: { name: "NYC Congestion Relief Zone" },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        // NE corner: 60th St & FDR / York Ave
        [-73.944080, 40.764000],
        // South along East River / FDR Drive
        [-73.950684, 40.755427],
        [-73.950901, 40.755152],
        [-73.951614, 40.754299],
        [-73.952027, 40.753830],
        [-73.952454, 40.753390],
        [-73.952821, 40.753001],
        [-73.953480, 40.752257],
        [-73.954020, 40.751814],
        [-73.954442, 40.751353],
        [-73.954547, 40.751243],
        [-73.954504, 40.751136],
        [-73.954537, 40.751035],
        [-73.954758, 40.750780],
        [-73.956155, 40.749788],
        [-73.957853, 40.748399],
        [-73.958719, 40.747116],
        [-73.959855, 40.745177],
        [-73.960747, 40.744171],
        [-73.962978, 40.738393],
        [-73.962667, 40.736980],
        [-73.962112, 40.734528],
        [-73.962298, 40.734287],
        [-73.962406, 40.732926],
        [-73.961465, 40.730764],
        [-73.961751, 40.728125],
        [-73.961924, 40.727543],
        [-73.961758, 40.725784],
        [-73.961933, 40.725286],
        [-73.962129, 40.725159],
        [-73.962109, 40.725105],
        [-73.962769, 40.722758],
        [-73.963339, 40.721898],
        [-73.964931, 40.721495],
        [-73.965694, 40.720683],
        [-73.967904, 40.717318],
        [-73.967305, 40.717015],
        [-73.968912, 40.713188],
        [-73.970006, 40.710549],
        [-73.970191, 40.709238],
        [-73.969867, 40.707916],
        [-73.969307, 40.707116],
        [-73.969262, 40.706803],
        [-73.969312, 40.705475],
        [-73.970087, 40.705752],
        [-73.970288, 40.705753],
        [-73.970183, 40.706940],
        [-73.970534, 40.707306],
        [-73.972260, 40.709102],
        [-73.972864, 40.708824],
        [-73.979120, 40.706065],
        [-73.980921, 40.705967],
        [-73.982756, 40.705680],
        [-73.983048, 40.705670],
        [-73.986417, 40.705454],
        [-73.990044, 40.705012],
        [-73.990749, 40.704900],
        [-73.993516, 40.704672],
        [-73.994563, 40.704271],
        [-73.995077, 40.704020],
        [-73.995757, 40.703877],
        [-73.995995, 40.703772],
        [-73.999550, 40.700430],
        [-74.000236, 40.699495],
        [-74.001107, 40.698089],
        [-74.001556, 40.697292],
        // Battery Park southern tip bridge
        [-74.014246, 40.700650],
        [-74.017439, 40.707540],
        // North along Hudson River / West Side Hwy
        [-74.023637, 40.718068],
        [-74.021347, 40.727482],
        [-74.021307, 40.727637],
        [-74.020639, 40.730391],
        [-74.017439, 40.743539],
        [-74.014246, 40.756656],
        [-74.014028, 40.757551],
        // NW corner: 60th St & West Side Hwy
        [-74.009321, 40.764000],
        // Close along 60th Street back to NE corner
        [-73.944080, 40.764000],
      ],
    ],
  },
};

/**
 * Key entry/exit points into the Congestion Relief Zone.
 * These are the toll collection locations.
 */
export const ENTRY_POINTS = [
  { name: "Lincoln Tunnel", coordinates: [-74.0024, 40.7590] as [number, number] },
  { name: "Holland Tunnel", coordinates: [-74.0089, 40.7273] as [number, number] },
  { name: "Hugh L. Carey Tunnel", coordinates: [-74.0106, 40.6997] as [number, number] },
  { name: "Queensboro Bridge", coordinates: [-73.9545, 40.7565] as [number, number] },
  { name: "Queens-Midtown Tunnel", coordinates: [-73.9695, 40.7454] as [number, number] },
  { name: "Williamsburg Bridge", coordinates: [-73.9719, 40.7131] as [number, number] },
  { name: "Manhattan Bridge", coordinates: [-73.9900, 40.7076] as [number, number] },
  { name: "Brooklyn Bridge", coordinates: [-74.0040, 40.7058] as [number, number] },
];
