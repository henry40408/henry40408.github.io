.DEFAULT_TARGET := debug
.PHONY := debug tinypng

debug:
	bundle exec middleman serve

tinypng:
	TINYPNG_API_KEY=$(shell cat .tinypng) \
	find source/images -type f -exec tinypng {} \+
