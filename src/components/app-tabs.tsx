import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";
import { useColorScheme } from "react-native";

import { Colors } from "@/constants/theme";

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
    >
      <NativeTabs.Trigger name="index">
        <Label>Map</Label>
        <Icon src={require("@/assets/images/tabIcons/home.png")} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="visits">
        <Label>Visits</Label>
        <Icon src={require("@/assets/images/tabIcons/explore.png")} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="want-to-go">
        <Label>Want to Go</Label>
        <Icon src={require("@/assets/images/tabIcons/home.png")} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
