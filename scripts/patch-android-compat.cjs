const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')

function patchFile(relativePath, replacements) {
  const filePath = path.join(root, relativePath)

  if (!fs.existsSync(filePath)) {
    return
  }

  let content = fs.readFileSync(filePath, 'utf8')
  let updated = content

  for (const [searchValue, replaceValue] of replacements) {
    updated = updated.split(searchValue).join(replaceValue)
  }

  if (updated !== content) {
    fs.writeFileSync(filePath, updated)
    console.log(`Patched ${relativePath}`)
  }
}

const java17Replacements = [
  ['sourceCompatibility JavaVersion.VERSION_21', 'sourceCompatibility JavaVersion.VERSION_17'],
  ['targetCompatibility JavaVersion.VERSION_21', 'targetCompatibility JavaVersion.VERSION_17'],
]

for (const relativePath of [
  'android/app/capacitor.build.gradle',
  'node_modules/@capacitor/android/capacitor/build.gradle',
  'node_modules/@capacitor/app/android/build.gradle',
  'node_modules/@capacitor/camera/android/build.gradle',
  'node_modules/@capacitor/local-notifications/android/build.gradle',
  'node_modules/@capacitor/preferences/android/build.gradle',
  'node_modules/@capgo/capacitor-social-login/android/build.gradle',
]) {
  patchFile(relativePath, java17Replacements)
}

patchFile('node_modules/@flomentumsolutions/capacitor-health-extended/android/build.gradle', [
  ...java17Replacements,
  ["apply plugin: 'com.android.library'\n\nandroid {", "apply plugin: 'com.android.library'\napply plugin: 'org.jetbrains.kotlin.android'\n\nandroid {"],
  ['jvmTarget = JvmTarget.JVM_21', 'jvmTarget = JvmTarget.JVM_17'],
])

patchFile('node_modules/@flomentumsolutions/capacitor-health-extended/android/src/main/java/com/flomentumsolutions/capacitor-health-extended/HealthPlugin.kt', [
  ['HealthPermission.PERMISSION_READ_EXERCISE_ROUTE', '"android.permission.health.READ_EXERCISE_ROUTE"'],
  ['HealthPermission.PERMISSION_WRITE_EXERCISE_ROUTE', '"android.permission.health.WRITE_EXERCISE_ROUTE"'],
])
