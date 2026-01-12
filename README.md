# Factors influencing vegetation recovery after wildfires in Indonesian peatlands

# Group project for Remote Sensing Applications

Link to shared Google Doc: 
https://docs.google.com/document/d/1qTkcDyN7AtKCjYgG5d_xGhStIbaDFv-rOpp8YKx7Ukg/edit?usp=sharing

Link to slides for first project draft presentation:
https://docs.google.com/presentation/d/1hMx8IagdemcvNNVpfwhAvoVakXih--StNohOCC3tltI/edit?usp=sharing

## Contents

The repository contains the following files:

#### `first_data_exploration.ipynb` (Nina)
- load in datasets and explore them visually
    - fire history image (yearly fire frequency) from Global forest watch (abandoned because RGB, not original data)
    - fire history (NASA FIRMS Modis fire alerts)
    - peat land map from Global Forest Watch (abandoned because old and not verifiable)
    
## How to activate environment

To activate the Python environment with all the necessary modules, run the following in the JupyterLab terminal (after navigating to the directory where `environment.yml` is stored):

```
conda env create -f environment.yml

python -m ipykernel install --user --name=rsapp_peat
```

Then you should be able to select `rsapp_peat` as the kernel for your Jupyter notebook.
