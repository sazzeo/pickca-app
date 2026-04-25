// @expo/vector-icons mock for jest
const React = require("react");
const { View, Text } = require("react-native");

function Icon({ name, size, color }) {
  return React.createElement(Text, { testID: `icon-${name}` }, name);
}

module.exports = {
  MaterialCommunityIcons: Icon,
  Ionicons: Icon,
  FontAwesome: Icon,
  Feather: Icon,
};
