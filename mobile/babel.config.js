module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "@babel/plugin-transform-class-static-block",
      [
        "module-resolver",
        {
          alias: {
            // 👇 redirect react-native-device-info to your shim
            "react-native-device-info": "./react-native-device-info.js",
          },
        },
      ],
    ],
  };
};
