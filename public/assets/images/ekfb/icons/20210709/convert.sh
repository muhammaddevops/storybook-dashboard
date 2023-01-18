for f in *.png; do convert $f -background none -resize 80x60^ -gravity Center -extent 80x60 -background none output.png && mv -v output.png $f; done
