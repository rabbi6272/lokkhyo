import { KeyboardAvoidingView, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Wrapper({ style, children, noTopMargin }: { style?: any; children: React.ReactNode; noTopMargin?: boolean }) {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={[styles.safe, style, {
        paddingTop: noTopMargin ? 0 : 12,
      }]}>
        {children}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 16,
  }
});