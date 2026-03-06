/// The defined study area is pre loaded as an asset in GEE

// ------------------------------------------------------------
// 1. Load Landsat 8 Collection 2 Level-2
// ------------------------------------------------------------
var dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterBounds(st_area.geometry());


// ------------------------------------------------------------
// 2. Apply scale factors (REQUIRED for L2 data)
// ------------------------------------------------------------
function applyScaleFactors(img) {
  var opticalBands = img.select('SR_B.')
                        .multiply(0.0000275)
                        .add(-0.2);
  return img.addBands(opticalBands, null, true);
}

dataset = dataset.map(applyScaleFactors);


// ------------------------------------------------------------
// 3. Function to calculate NBR
//    NBR = (NIR - SWIR2) / (NIR + SWIR2)
//    Landsat 8: NIR = SR_B5, SWIR2 = SR_B7
// ------------------------------------------------------------
function calculateNBR(img) {
  var nbr = img.normalizedDifference(['SR_B5', 'SR_B7'])
               .rename('NBR');
  return img.addBands(nbr);
}

dataset = dataset.map(calculateNBR);


// ------------------------------------------------------------
// 4. Define time periods
// ------------------------------------------------------------

// Pre-fire composite (June + July 2015)
var preFire = dataset
    .filterDate('2015-06-01', '2015-07-30')
    .select('NBR')
    .median()
    .rename('NBR_pre');

// Post-fire composite (November + December 2015)
var postFire = dataset
    .filterDate('2015-11-01', '2015-12-31')
    .select('NBR')
    .median()
    .rename('NBR_post');


// ------------------------------------------------------------
// 5. Single mask from study area only
// ------------------------------------------------------------
var maskStudyArea = st_area.select('b1').eq(1);

preFire  = preFire.updateMask(maskStudyArea);
postFire = postFire.updateMask(maskStudyArea);


// ------------------------------------------------------------
// 6. Calculate dNBR (Pre - Post)
// ------------------------------------------------------------
var dNBR = preFire.subtract(postFire).rename('dNBR');


// ------------------------------------------------------------
// 7. Mask out physically impossible values (theoretical range -2 to +2)
//    Anything outside = NA (renders black on map)
// ------------------------------------------------------------
var validMask = dNBR.gte(-2).and(dNBR.lte(2));
var dNBR_clean = dNBR.updateMask(validMask).updateMask(maskStudyArea);


// ------------------------------------------------------------
// 8. Classify dNBR into burn severity classes
// ------------------------------------------------------------
var severity = dNBR_clean.expression(
  "(b < 0.053) ? 1" +
  ": (b < 0.213) ? 2" +
  ": (b < 0.420) ? 3" +
  ": (b < 0.661) ? 4" +
  ": 5",
  { 'b': dNBR_clean }
)
.rename('Burn_Severity')
.updateMask(maskStudyArea);


// ------------------------------------------------------------
// 9. Visualization
// ------------------------------------------------------------
var nbrVis = {
  min: -1,
  max: 1,
  palette: ['red', 'white', 'green']
};

var dNBRVis = {
  min: -2,
  max: 2,
  palette: ['blue', 'white', 'yellow', 'orange', 'red']
};

var severityVis = {
  min: 1,
  max: 5,
  palette: [
    'green',   // 1 = Unburned
    'yellow',  // 2 = Low
    'orange',  // 3 = Moderate
    'red',     // 4 = High
    'purple'   // 5 = Very High
  ]
};

Map.addLayer(st_area,  {color: '7B2D8B'}, 'Study Area Kalimantan');
Map.addLayer(preFire,  nbrVis,            'NBR Pre-Fire');
Map.addLayer(postFire, nbrVis,            'NBR Post-Fire');
Map.addLayer(severity, severityVis,       'Burn Severity Classes');
Map.centerObject(st_area, 10);


// ------------------------------------------------------------
// 10. Export all three layers to Drive folder: predictors
// ------------------------------------------------------------

// Pre-fire NBR (continuous, float)
Export.image.toDrive({
  image: preFire,
  description: 'NBR_PreFire',
  folder: 'B_Severity',
  fileNamePrefix: 'NBR_PreFire',
  region: st_area.geometry(),
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});

// Post-fire NBR (continuous, float)
Export.image.toDrive({
  image: postFire,
  description: 'NBR_PostFire',
  folder: 'B_Severity',
  fileNamePrefix: 'NBR_PostFire',
  region: st_area.geometry(),
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});

// Burn Severity Classification (integer classes 1–5)
Export.image.toDrive({
  image: severity.toInt8(),
  description: 'Burn_Severity_Classes',
  folder: 'B_Severity',
  fileNamePrefix: 'Burn_Severity_Classes',
  region: st_area.geometry(),
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});
