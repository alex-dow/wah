const conf = JSON.parse(JSON.stringify(require('../../.eslintrc.js')));

conf.extends = [
  'plugin:vue/essential',
  'eslint:recommended',
  '@vue/typescript',
  'plugin:@typescript-eslint/eslint-recommended',
  'plugin:@typescript-eslint/recommended'
]

conf.parser = 'vue-eslint-parser';
// conf.extends.push('plugin:vue/recommended');
conf.plugins.push("vue");

module.exports = conf;
