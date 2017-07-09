module.exports = {
    "globals":{
        "module":true,
        "require":true
    },
    "extends": "eslint:recommended",
    "env":{
        "es6": true,
        "browser": true
    },
    "rules": {
        "indent": ["error", 4],
        "semi": ["error", "always"],

        "no-console": "off"
    }
};