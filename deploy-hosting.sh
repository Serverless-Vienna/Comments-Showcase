npm run build
firebase deploy --only hosting
find ./build/static/js -type f -exec gzip -9 "{}" \; -exec mv "{}.gz" "{}" \;
aws s3 cp build s3://serverless-vienna.holupi.com/ --recursive
chrome https://console.aws.amazon.com/s3/buckets/serverless-vienna.holupi.com/static/js/\?region\=us-east-1\&tab\=overview
