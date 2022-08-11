#!/bin/bash

for f in $(ls *.svg);do inkscape -h 60 $f --export-filename "$(basename $f .svg).png";done

