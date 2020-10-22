#!/bin/bash
date=$(date '+%Y-%m-%d')
name=market_markup_extension.$date.zip
rm $name
zip -r $name ./dist

