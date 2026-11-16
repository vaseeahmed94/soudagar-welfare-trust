export default {
  "*.{js,mjs,cjs,ts,tsx,gs}": [
    "eslint --fix --max-warnings 0",
    "prettier --write",
  ],
  "*.{css,json,md,html,yml,yaml}": "prettier --write",
};
