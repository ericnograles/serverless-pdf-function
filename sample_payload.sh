curl -X POST \
  https://your.api.gateway.com/dev/utils/pdf \
  -H 'accept: application/pdf' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'postman-token: a828c36d-ad9b-7cb2-5870-9aec676b1404' \
  -d '{
	"html": "hi",
	"send_binary": true
}'