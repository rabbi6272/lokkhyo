npx expo prebuild -p android --clean
sed -i 's/^reactNativeArchitectures=.*/reactNativeArchitectures=arm64-v8a/' android/gradle.properties
grep reactNativeArchitectures android/gradle.properties
npx eas build --profile development --platform android --local