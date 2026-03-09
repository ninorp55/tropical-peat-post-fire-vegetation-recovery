// ------------------
// Study area (approximate bounding coordinates of Kalimantan)
// ------------------

var roi = ee.Geometry.Rectangle([108.5, -4.2, 119.1, 4.35]);

// ------------------
// MODIS EVI
// ------------------

var modis = ee
  .ImageCollection("MODIS/061/MOD13Q1")
  .select(["EVI", "SummaryQA"]);

// Pre-fire baseline
var preEVI = modis.filterDate("2010-08-01", "2015-07-31").median().clip(roi);

// Post-fire (3 months)
var postEVI = modis.filterDate("2015-11-01", "2016-01-31").median().clip(roi);

// 2017
var evi2017 = modis.filterDate("2017-01-01", "2017-12-31").median().clip(roi);

// 2020
var evi2020 = modis.filterDate("2020-01-01", "2020-12-31").median().clip(roi);

// ------------------
// MODIS Surface Reflectance (export NIR + SWIR for NBR calculation)
// ------------------

var sr = ee
  .ImageCollection("MODIS/061/MOD09A1")
  .select(["sur_refl_b02", "sur_refl_b07", "StateQA"]);

// Pre-fire composite (3 months before fire season)
var sr_pre = sr.filterDate("2015-05-01", "2015-07-31").median().clip(roi);

// Post-fire composite (3 months after fire season)
var sr_post = sr.filterDate("2015-11-01", "2016-01-31").median().clip(roi);

// ------------------
// FireCCI Burned Area
// ------------------

var fire = ee
  .ImageCollection("ESA/CCI/FireCCI/5_1")
  .filterDate("2015-08-01", "2015-10-31")
  .median()
  .clip(roi);

// ------------------
// Export function
// ------------------

function exportImg(img, name) {
  Export.image.toDrive({
    image: img.toInt16(), // to reduce file size
    description: name,
    region: roi,
    scale: 250,
    maxPixels: 1e13,
  });
}

// ------------------
// Export layers
// ------------------

exportImg(preEVI, "EVI_pre");
exportImg(postEVI, "EVI_post");
exportImg(evi2017, "EVI_2017");
exportImg(evi2020, "EVI_2020");

exportImg(sr_pre, "MODIS_SR_pre_fire");
exportImg(sr_post, "MODIS_SR_post_fire");

exportImg(fire, "FireCCI_2015");
