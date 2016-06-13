#!/bin/sh

aws s3 sync "./asset/75" "s3://brick-web/ds/$1/asset/75"