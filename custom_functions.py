# Definitions of custom functions used across notebooks

# 1. function to filter xarray file spatially based on shapefile 
import geopandas as gpd
import xarray as xr

def sel_bounds(xr_obj, mask):
    
    """Clip a rioxarray array/dataset to the bounding coordinates of a shapefile or another rioxarray object. Both must have the same CRS."""

    if isinstance(mask, gpd.GeoDataFrame):
        xmin = mask.bounds.minx.item()
        xmax = mask.bounds.maxx.item()
        ymin = mask.bounds.miny.item()
        ymax = mask.bounds.maxy.item()

    elif isinstance(mask, (xr.DataArray, xr.Dataset)):
        xmin = mask.x.values.min()
        xmax = mask.x.values.max()
        ymin = mask.y.values.min()
        ymax = mask.y.values.max()
    
    clipped = xr_obj.sel(x=slice(xmin, xmax), y=slice(ymax, ymin))
    
    return clipped