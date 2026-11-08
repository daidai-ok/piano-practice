.PHONY: deploy

deploy:
	npm run build
	npx wrangler deploy --secrets-file .dev.vars
