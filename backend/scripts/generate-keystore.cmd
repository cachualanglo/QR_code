@echo off
set KEYSTORE_FILE=keystore.p12
set PASSWORD=password
if exist %KEYSTORE_FILE% (
  echo Keystore already exists at %KEYSTORE_FILE%
  exit /b 0
)
if not exist "%JAVA_HOME%\bin\keytool.exe" (
  echo keytool not found. Ensure JDK is installed and JAVA_HOME is set.
  exit /b 1
)
"%JAVA_HOME%\bin\keytool.exe" -genkeypair -alias server -keyalg RSA -keysize 2048 -storetype PKCS12 -keystore "%KEYSTORE_FILE%" -storepass "%PASSWORD%" -keypass "%PASSWORD%" -dname "CN=localhost, OU=Dev, O=AI, L=City, S=State, C=US"
echo Keystore generated at %KEYSTORE_FILE%
