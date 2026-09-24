import { Colors } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SvgIcon } from "./SvgIcon";

export function BackStep({ title, onBack }: { title: string; onBack?: () => void }) {
	return (
		<View style={[styles.container, { backgroundColor: Colors.background }]}>
			<View style={styles.content}>
				{onBack && (
					<Pressable onPress={onBack} android_ripple={{ color: Colors.icon }}>
						<SvgIcon name="arrowLeft" size={22} color={Colors.text} />
					</Pressable>
				)}

				<Text style={{ fontSize: 20, color: Colors.text, fontFamily: "InterMedium" }}>
					{title}
				</Text>

				{onBack && <View style={styles.spacer} />}
			</View>
		</View>
	)
}
const styles = StyleSheet.create({
	container: {
		width: "100%",
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		height: 86,
		paddingHorizontal: 16,
		paddingTop: 32,
	},
	spacer: {
		width: 26,
	},
})