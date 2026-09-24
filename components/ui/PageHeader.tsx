import { View, StyleSheet } from "react-native";
import { ThemedText } from "../ThemedText";
import { ExternalPathString, Link } from "expo-router";
import { HelloWave } from "../HelloWave";
import { Colors } from "@/constants/theme";
import { SvgIcon } from "./SvgIcon";

export function PageHeader({ title, actions, icon, helloWave }: { title: string; actions?: ExternalPathString; icon?: any, helloWave?: boolean }) {
	return (
		<View style={styles.header}>
			<ThemedText style={{ lineHeight: 36 }} type="title">
				{title}
				{helloWave && <HelloWave />}
			</ThemedText>
			{actions && icon && (
				<Link href={actions} style={styles.add}>
					<SvgIcon color={Colors.tint} size={26} name={icon} />
				</Link>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	add: {
		padding: 4,
	},
})