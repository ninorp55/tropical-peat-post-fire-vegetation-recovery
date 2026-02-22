// ---------------------------------------------
// 1. Define region (Indonesia)
// ---------------------------------------------
var region = ee.Geometry.Rectangle([
  95.01270593,
  -10.92262135,
  140.97762699,
  5.91010163
]);

Map.centerObject(region, 6);

// ---------------------------------------------
// 2. Load FireCCI 5.1 for 2015 only
// ---------------------------------------------
var fire2015 = ee.ImageCollection('ESA/CCI/FireCCI/5_1')
  .filterBounds(region)
  .filterDate('2015-01-01', '2016-01-01');

// ---------------------------------------------
// 3. Create burn mask for DOY 213–304
// Aug 1 = DOY 213
// Oct 31 = DOY 304
// ---------------------------------------------
var burnWindow = fire2015
  .select('BurnDate')
  .map(function(img) {
    return img.gte(213).and(img.lte(304));
  })
  .max()   // burned at least once in that window
  .rename('Burn_AugOct_2015')
  .clip(region)
  .toByte();

// ---------------------------------------------
// 4. Visualize
// ---------------------------------------------
Map.addLayer(burnWindow, {
  min: 0,
  max: 1,
  palette: ['white', 'red']
}, 'Burned Aug–Oct 2015');

// ---------------------------------------------
// 5. Export
// ---------------------------------------------
Export.image.toDrive({
  image: burnWindow,
  description: 'FireCCI_Burn_AugOct_2015',
  folder: 'FireCCI_Event',
  region: region,
  scale: 250,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});
