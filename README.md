Nas pastas frontend e backend:
	npm install

Na pasta backend:
	criar arquivo .env 
 		nesse arquivo, digite: 
   			"DATABASE_URL=file:./dev.db"
			"GROQ_API_KEY=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"
   	npx prisma migrate dev
	para rodar o banco

Para iniciar o back:
	node index.js

Para iniciar o front:
	npm start ou npm run dev

obs: em prompts separados
