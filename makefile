runnode:
	npx hardhat node

deploy:

	npx hardhat run src/contract/scripts/deploy.js --network localhost

deploy-sepolia:
	npx hardhat run src/contract/scripts/deploy.js --network sepolia

start:
	npm run start