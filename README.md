# Multiple factors drive post-fire vegetation recovery in tropical peat forests
# A random forest study in Kalimantan, Indonesia

This repository contains the code for a project about the factors influencing post-fire vegetation recovery in tropical peat forests in Indonesia. It was developed as part of the course 'Introduction to Global Remote Sensing Data Products' by Prof. Jian Peng at the University of Leipzig.

## Contents

`main.tex`

TeX document that can be used to generate the report PDF

`1_study_area.ipynb`

Jupyter Notebook used to identify the pixels we used as our study area

`2_vegetation_recovery_metrics.ipynb`

Jupyter Notebook used to calculate vegetation recovery rates for our study area

`3_predictors.ipynb`

Jupyter Notebook for preprocessing of predictor layers

`4_random_forest.ipynb`

Jupyter Notebook for preparing, conducting, and evaluating the random forest prediction of vegetation recovery based on predictors

`GEE_scripts.js`

JavaScript file used to retrieve MODIS data from Google Earth Engine

`environment.yml`

YAML file for reconstructing the conda environment needed to run the Jupyter notebooks, see instructions below
    
## How to activate environment

To activate the Python environment with all the necessary libraries, run the following in the JupyterLab terminal (after navigating to the directory where `environment.yml` is stored, if necessary):

```
conda env create -f environment.yml
```

Activate the environment by running
```
conda activate rsapp_peat
```

With the environment activated, run the following command to create a kernel:

```
python -m ipykernel install --user --name=rsapp_peat
```

Then you should be able to select `rsapp_peat` as the kernel for the Jupyter notebooks.

**Note**

Creating the environment requires the channel `conda-forge`. You can check if you have if by running

```
conda config --show channels
```

If this does not include `conda-forge`, install it by running

```
conda config --add channels conda-forge
conda config --set channel_priority strict
```
