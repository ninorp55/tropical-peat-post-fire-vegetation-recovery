/// First load the burn raster in the assets 
/// projects/rsapp-data-exploration/assets/burned-area-aug-to-oct-2015

// ------------------------------------------------------------
// 1. Load Landsat 8 Collection 2 Level-2
// ------------------------------------------------------------
var dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterBounds(burn_raster.geometry());


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

// Pre-fire composite (May + June 2019)
var preFire = dataset
    .filterDate('2015-05-01', '2015-06-30')
    .select('NBR')
    .median()
    .rename('NBR_pre');


// Post-fire composite (November + December 2019)
var postFire = dataset
    .filterDate('2015-11-01', '2015-12-31')
    .select('NBR')
    .median()
    .rename('NBR_post');


// ------------------------------------------------------------
// 5. Apply your burned area mask
// ------------------------------------------------------------
var maskBinary = burn_raster
    .select('b1')
    .eq(1);

preFire = preFire.updateMask(maskBinary);
postFire = postFire.updateMask(maskBinary);


// ------------------------------------------------------------
// 6. Calculate dNBR (Pre - Post)
// ------------------------------------------------------------
var dNBR = preFire.subtract(postFire)
                  .rename('dNBR');


// ------------------------------------------------------------
// 7. Visualization
// ------------------------------------------------------------

// NBR visualization
var nbrVis = {
  min: -1,
  max: 1,
  palette: ['red', 'white', 'green']
};

// dNBR visualization (burn severity scale)
var dNBRVis = {
  min: -0.5,
  max: 1,
  palette: ['blue', 'white', 'yellow', 'orange', 'red']
};

 // ------------------------------------------------------------
// 8. Classify dNBR into burn severity classes
//    (Explicitly masked to burn_raster)
// ------------------------------------------------------------

// Burn mask (b1 == 1)
var maskBinary = burn_raster.select('b1').eq(1);

var severity = dNBR.expression(
  "(b < 0.053) ? 1" +
  ": (b < 0.213) ? 2" +
  ": (b < 0.420) ? 3" +
  ": (b < 0.661) ? 4" +
  ": 5",
  { 'b': dNBR }
)
.rename('Burn_Severity')
.updateMask(maskBinary);   // Ensures classification ONLY inside burn raster


var severityVis = {
  min: 1,
  max: 5,
  palette: [
    'green',   // 1 = Unchanged
    'yellow',  // 2 = Low
    'orange',  // 3 = Moderate
    'red',     // 4 = High
    'purple'   // 5 = Very High
  ]
};

Map.addLayer(severity, severityVis, 'Burn Severity Classes');
// ------------------------------------------------------------
// Add a dot at specific coordinate
// ------------------------------------------------------------

Map.addLayer(point, {color: 'black'}, 'My Point');

Map.centerObject(point, 10);
// ---------------------------------------------
// 9. Export Burn Severity Raster (GeoTIFF)
// ---------------------------------------------

Export.image.toDrive({
  image: severity.toInt8(),   // Export classified burn severity
  description: 'dNBR_BurnSeverity_2015',
  folder: 'Fire_2015',
  fileNamePrefix: 'Burn_Severity_2015',
  region: burn_raster.geometry(),   // Export exactly your burn area
  scale: 30,                        // Landsat 8 resolution
  crs: 'EPSG:4326',                  // WGS84 (change if needed)
  maxPixels: 1e13
});
