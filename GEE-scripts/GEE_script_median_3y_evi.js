// ---------------------------------------------
// 1. Define region using burn area
// ---------------------------------------------
var burn_raster = ee.Image(
  "projects/rsapp-data-exploration/assets/burned-area-aug-to-oct-2015",
);

var maskBinary = burn_raster.select("b1").eq(1);

Map.centerObject(burn_raster, 5);

// ---------------------------------------------
// 2. Define 3-year baseline period
// (change years if needed)
// ---------------------------------------------
var startDate = "2012-08-01";
var endDate = "2015-07-31"; // 3 full years

// ---------------------------------------------
// 3. Load Landsat 8 Collection 2 Level-2
// ---------------------------------------------
var landsat = ee
  .ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filterBounds(burn_raster.geometry())
  .filterDate(startDate, endDate);

landsat = landsat.map(function (img) {
  return img.updateMask(maskBinary);
});

// ---------------------------------------------
// 4. Cloud + Shadow + Snow Mask
// ---------------------------------------------
function maskL8(image) {
  var qa = image.select("QA_PIXEL");

  // Bit flags (Collection 2)
  var cloud = qa.bitwiseAnd(1 << 3).neq(0);
  var shadow = qa.bitwiseAnd(1 << 4).neq(0);
  var snow = qa.bitwiseAnd(1 << 5).neq(0);

  var mask = cloud.or(shadow).or(snow).not();

  // Apply reflectance scaling factor
  var optical = image
    .select([
      "SR_B2", // blue
      "SR_B4", // red
      "SR_B5", // nir
    ])
    .multiply(0.0000275)
    .add(-0.2);

  return image.addBands(optical, null, true).updateMask(mask);
}

var landsatMasked = landsat.map(maskL8);

// ---------------------------------------------
// 5. Compute EVI
// ---------------------------------------------
function addEVI(image) {
  var nir = image.select("SR_B5");
  var red = image.select("SR_B4");
  var blue = image.select("SR_B2");

  var evi = nir
    .subtract(red)
    .multiply(2.5)
    .divide(nir.add(red.multiply(6)).subtract(blue.multiply(7.5)).add(1))
    .rename("EVI");

  return image.addBands(evi);
}

var landsatEVI = landsatMasked.map(addEVI);

// ---------------------------------------------
// 6. 3-Year Median Composite
// ---------------------------------------------
var medianEVI = landsatEVI.select("EVI").median().toFloat();

// ---------------------------------------------
// 7. Visualize
// ---------------------------------------------
Map.addLayer(
  medianEVI,
  {
    min: 0,
    max: 0.8,
    palette: ["brown", "yellow", "green"],
  },
  "3-Year Median EVI",
);

// ---------------------------------------------
// 8. Export to Google Drive
// ---------------------------------------------
Export.image.toDrive({
  image: medianEVI,
  description: "Landsat_MedianEVI_2012_2015",
  folder: "Landsat_EVI_Baseline",
  region: burn_raster,
  scale: 30,
  crs: "EPSG:4326",
  maxPixels: 1e13,
});
