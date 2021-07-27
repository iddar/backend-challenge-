#!/bin/sh

case $RUN_MODE in
	gather)
		while true; do
			npm run gather
			sleep 60
		done
		;;
	*)
		npm run test && npm run dev
esac
