.DEFAULT_TARGET := serve
.PHONY := debug serve tinypng

debug:
	bundle exec middleman serve --verbose

serve:
	bundle exec middleman serve

tinypng:
	TINYPNG_API_KEY=$(shell cat .tinypng) \
	find source/images -type f -exec tinypng {} \+
