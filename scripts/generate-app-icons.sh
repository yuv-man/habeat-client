#!/bin/bash

# Script to generate app icons for iOS and Android from habeatIcon.png
# Requires ImageMagick or sips (built into macOS)

SOURCE_ICON="src/assets/habeatIcon.png"
IOS_ICON_DIR="ios/App/App/Assets.xcassets/AppIcon.appiconset"
ANDROID_RES_DIR="android/app/src/main/res"

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "❌ Error: Source icon not found at $SOURCE_ICON"
    exit 1
fi

# Check for sips (macOS built-in) or ImageMagick
if command -v sips &> /dev/null; then
    RESIZE_CMD="sips"
elif command -v convert &> /dev/null; then
    RESIZE_CMD="convert"
else
    echo "❌ Error: Neither 'sips' nor 'ImageMagick' found. Please install ImageMagick: brew install imagemagick"
    exit 1
fi

echo "📱 Generating app icons from $SOURCE_ICON..."

# iOS App Icon Sizes
echo "📱 Generating iOS icons..."
mkdir -p "$IOS_ICON_DIR"

# iOS required sizes (in points, @2x/@3x means multiply by 2 or 3 for pixels)
# 20pt @2x = 40px, @3x = 60px
# 29pt @2x = 58px, @3x = 87px
# 40pt @2x = 80px, @3x = 120px
# 60pt @2x = 120px, @3x = 180px
# 76pt @1x = 76px, @2x = 152px
# 83.5pt @2x = 167px
# 1024px for App Store

if [ "$RESIZE_CMD" = "sips" ]; then
    sips -z 40 40 "$SOURCE_ICON" --out "$IOS_ICON_DIR/AppIcon-20@2x.png" 2>/dev/null
    sips -z 60 60 "$SOURCE_ICON" --out "$IOS_ICON_DIR/AppIcon-20@3x.png" 2>/dev/null
    sips -z 58 58 "$SOURCE_ICON" --out "$IOS_ICON_DIR/AppIcon-29@2x.png" 2>/dev/null
    sips -z 87 87 "$SOURCE_ICON" --out "$IOS_ICON_DIR/AppIcon-29@3x.png" 2>/dev/null
    sips -z 80 80 "$SOURCE_ICON" --out "$IOS_ICON_DIR/AppIcon-40@2x.png" 2>/dev/null
    sips -z 120 120 "$SOURCE_ICON" --out "$IOS_ICON_DIR/AppIcon-40@3x.png" 2>/dev/null
    sips -z 120 120 "$SOURCE_ICON" --out "$IOS_ICON_DIR/AppIcon-60@2x.png" 2>/dev/null
    sips -z 180 180 "$SOURCE_ICON" --out "$IOS_ICON_DIR/AppIcon-60@3x.png" 2>/dev/null
    sips -z 76 76 "$SOURCE_ICON" --out "$IOS_ICON_DIR/AppIcon-76@1x.png" 2>/dev/null
    sips -z 152 152 "$SOURCE_ICON" --out "$IOS_ICON_DIR/AppIcon-76@2x.png" 2>/dev/null
    sips -z 167 167 "$SOURCE_ICON" --out "$IOS_ICON_DIR/AppIcon-83.5@2x.png" 2>/dev/null
    sips -z 1024 1024 "$SOURCE_ICON" --out "$IOS_ICON_DIR/AppIcon-1024@1x.png" 2>/dev/null
else
    convert "$SOURCE_ICON" -resize 40x40 "$IOS_ICON_DIR/AppIcon-20@2x.png"
    convert "$SOURCE_ICON" -resize 60x60 "$IOS_ICON_DIR/AppIcon-20@3x.png"
    convert "$SOURCE_ICON" -resize 58x58 "$IOS_ICON_DIR/AppIcon-29@2x.png"
    convert "$SOURCE_ICON" -resize 87x87 "$IOS_ICON_DIR/AppIcon-29@3x.png"
    convert "$SOURCE_ICON" -resize 80x80 "$IOS_ICON_DIR/AppIcon-40@2x.png"
    convert "$SOURCE_ICON" -resize 120x120 "$IOS_ICON_DIR/AppIcon-40@3x.png"
    convert "$SOURCE_ICON" -resize 120x120 "$IOS_ICON_DIR/AppIcon-60@2x.png"
    convert "$SOURCE_ICON" -resize 180x180 "$IOS_ICON_DIR/AppIcon-60@3x.png"
    convert "$SOURCE_ICON" -resize 76x76 "$IOS_ICON_DIR/AppIcon-76@1x.png"
    convert "$SOURCE_ICON" -resize 152x152 "$IOS_ICON_DIR/AppIcon-76@2x.png"
    convert "$SOURCE_ICON" -resize 167x167 "$IOS_ICON_DIR/AppIcon-83.5@2x.png"
    convert "$SOURCE_ICON" -resize 1024x1024 "$IOS_ICON_DIR/AppIcon-1024@1x.png"
fi

# Android App Icon Sizes (in dp, mdpi=1x, hdpi=1.5x, xhdpi=2x, xxhdpi=3x, xxxhdpi=4x)
# Standard launcher icon: 48dp
# mdpi: 48px, hdpi: 72px, xhdpi: 96px, xxhdpi: 144px, xxxhdpi: 192px

echo "🤖 Generating Android icons..."

if [ "$RESIZE_CMD" = "sips" ]; then
    sips -z 48 48 "$SOURCE_ICON" --out "$ANDROID_RES_DIR/mipmap-mdpi/ic_launcher.png" 2>/dev/null
    sips -z 48 48 "$SOURCE_ICON" --out "$ANDROID_RES_DIR/mipmap-mdpi/ic_launcher_round.png" 2>/dev/null
    sips -z 108 108 "$SOURCE_ICON" --out "$ANDROID_RES_DIR/mipmap-mdpi/ic_launcher_foreground.png" 2>/dev/null
    
    sips -z 72 72 "$SOURCE_ICON" --out "$ANDROID_RES_DIR/mipmap-hdpi/ic_launcher.png" 2>/dev/null
    sips -z 72 72 "$SOURCE_ICON" --out "$ANDROID_RES_DIR/mipmap-hdpi/ic_launcher_round.png" 2>/dev/null
    sips -z 162 162 "$SOURCE_ICON" --out "$ANDROID_RES_DIR/mipmap-hdpi/ic_launcher_foreground.png" 2>/dev/null
    
    sips -z 96 96 "$SOURCE_ICON" --out "$ANDROID_RES_DIR/mipmap-xhdpi/ic_launcher.png" 2>/dev/null
    sips -z 96 96 "$SOURCE_ICON" --out "$ANDROID_RES_DIR/mipmap-xhdpi/ic_launcher_round.png" 2>/dev/null
    sips -z 216 216 "$SOURCE_ICON" --out "$ANDROID_RES_DIR/mipmap-xhdpi/ic_launcher_foreground.png" 2>/dev/null
    
    sips -z 144 144 "$SOURCE_ICON" --out "$ANDROID_RES_DIR/mipmap-xxhdpi/ic_launcher.png" 2>/dev/null
    sips -z 144 144 "$SOURCE_ICON" --out "$ANDROID_RES_DIR/mipmap-xxhdpi/ic_launcher_round.png" 2>/dev/null
    sips -z 324 324 "$SOURCE_ICON" --out "$ANDROID_RES_DIR/mipmap-xxhdpi/ic_launcher_foreground.png" 2>/dev/null
    
    sips -z 192 192 "$SOURCE_ICON" --out "$ANDROID_RES_DIR/mipmap-xxxhdpi/ic_launcher.png" 2>/dev/null
    sips -z 192 192 "$SOURCE_ICON" --out "$ANDROID_RES_DIR/mipmap-xxxhdpi/ic_launcher_round.png" 2>/dev/null
    sips -z 432 432 "$SOURCE_ICON" --out "$ANDROID_RES_DIR/mipmap-xxxhdpi/ic_launcher_foreground.png" 2>/dev/null
else
    convert "$SOURCE_ICON" -resize 48x48 "$ANDROID_RES_DIR/mipmap-mdpi/ic_launcher.png"
    convert "$SOURCE_ICON" -resize 48x48 "$ANDROID_RES_DIR/mipmap-mdpi/ic_launcher_round.png"
    convert "$SOURCE_ICON" -resize 108x108 "$ANDROID_RES_DIR/mipmap-mdpi/ic_launcher_foreground.png"
    
    convert "$SOURCE_ICON" -resize 72x72 "$ANDROID_RES_DIR/mipmap-hdpi/ic_launcher.png"
    convert "$SOURCE_ICON" -resize 72x72 "$ANDROID_RES_DIR/mipmap-hdpi/ic_launcher_round.png"
    convert "$SOURCE_ICON" -resize 162x162 "$ANDROID_RES_DIR/mipmap-hdpi/ic_launcher_foreground.png"
    
    convert "$SOURCE_ICON" -resize 96x96 "$ANDROID_RES_DIR/mipmap-xhdpi/ic_launcher.png"
    convert "$SOURCE_ICON" -resize 96x96 "$ANDROID_RES_DIR/mipmap-xhdpi/ic_launcher_round.png"
    convert "$SOURCE_ICON" -resize 216x216 "$ANDROID_RES_DIR/mipmap-xhdpi/ic_launcher_foreground.png"
    
    convert "$SOURCE_ICON" -resize 144x144 "$ANDROID_RES_DIR/mipmap-xxhdpi/ic_launcher.png"
    convert "$SOURCE_ICON" -resize 144x144 "$ANDROID_RES_DIR/mipmap-xxhdpi/ic_launcher_round.png"
    convert "$SOURCE_ICON" -resize 324x324 "$ANDROID_RES_DIR/mipmap-xxhdpi/ic_launcher_foreground.png"
    
    convert "$SOURCE_ICON" -resize 192x192 "$ANDROID_RES_DIR/mipmap-xxxhdpi/ic_launcher.png"
    convert "$SOURCE_ICON" -resize 192x192 "$ANDROID_RES_DIR/mipmap-xxxhdpi/ic_launcher_round.png"
    convert "$SOURCE_ICON" -resize 432x432 "$ANDROID_RES_DIR/mipmap-xxxhdpi/ic_launcher_foreground.png"
fi

echo "✅ App icons generated successfully!"
echo ""
echo "📱 iOS icons: $IOS_ICON_DIR"
echo "🤖 Android icons: $ANDROID_RES_DIR/mipmap-*/"
echo ""
echo "⚠️  Note: You may need to update Contents.json for iOS to reference all icon sizes."

