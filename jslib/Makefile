GENERATED_FILES = \
	id3lab.js 

all: $(GENERATED_FILES)

browserify:
	@browserify -r underscore -r d3 -r ipy_node -r id3 -r jQuery-browserify ./index.js > id3lab.js
